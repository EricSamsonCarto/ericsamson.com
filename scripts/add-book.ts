import { existsSync } from 'node:fs';
import { copyFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { z } from 'astro/zod';

const OPEN_LIBRARY_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org/b/id';
const BOOKS_CONTENT_DIR = 'src/content/books';
const BOOK_COVERS_DIR = 'src/assets/images/writing/books';
const COVER_DOWNLOAD_TIMEOUT_MS = 20_000;

const BookArgumentsSchema = z.object({
  title: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().min(1),
  author: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
});

const SearchDocSchema = z.object({
  title: z.string(),
  author_name: z.array(z.string()).default([]),
  cover_i: z.number().optional(),
  cover_edition_key: z.string().optional(),
  isbn: z.array(z.string()).default([]),
});

const SearchResponseSchema = z.object({
  docs: z.array(SearchDocSchema),
});

const EditionSchema = z.object({
  isbn_13: z.array(z.string()).default([]),
  isbn_10: z.array(z.string()).default([]),
});

type BookArguments = z.infer<typeof BookArgumentsSchema>;
type SearchDoc = z.infer<typeof SearchDocSchema>;

type BookEntry = {
  title: string;
  author: string;
  quote: string;
  date: string;
  isbn: string;
  rating: number;
  slug: string;
};

const USAGE =
  'Usage: npm run add-book -- --title "Dune" --rating 5 --quote "I must not fear." [--author "Frank Herbert"] [--cover ./dune.jpg]';

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const pickIsbn = (isbns: readonly string[]): string | undefined =>
  isbns.find((isbn) => isbn.length === 13) ?? isbns[0];

export const toFrontmatter = (book: BookEntry): string =>
  [
    '---',
    `title: ${JSON.stringify(book.title)}`,
    `author: ${JSON.stringify(book.author)}`,
    `quote: ${JSON.stringify(book.quote)}`,
    `date: ${book.date}`,
    `ISBN: ${JSON.stringify(book.isbn)}`,
    `rating: ${book.rating}`,
    `thumbnail: "../../assets/images/writing/books/${book.slug}.jpg"`,
    '---',
    '',
  ].join('\n');

const parseBookArguments = (argv: readonly string[]): BookArguments => {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      title: { type: 'string' },
      rating: { type: 'string' },
      quote: { type: 'string' },
      author: { type: 'string' },
      cover: { type: 'string' },
    },
  });
  const parsed = BookArgumentsSchema.safeParse(values);
  if (!parsed.success) {
    throw new Error(`${USAGE}\n\n${parsed.error.issues.map((issue) => `--${issue.path.join('.')}: ${issue.message}`).join('\n')}`);
  }
  return parsed.data;
};

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};

const searchOpenLibrary = async (options: { title: string; author?: string }): Promise<SearchDoc> => {
  const { title, author } = options;
  const params = new URLSearchParams({
    title,
    limit: '1',
    fields: 'title,author_name,cover_i,cover_edition_key,isbn',
    ...(author ? { author } : {}),
  });
  const { docs } = SearchResponseSchema.parse(await fetchJson(`${OPEN_LIBRARY_URL}/search.json?${params}`));
  const [firstMatch] = docs;
  if (!firstMatch) {
    throw new Error(`No Open Library match for "${title}". Try adding --author.`);
  }
  return firstMatch;
};

const fetchCoverEditionIsbn = async (editionKey: string | undefined): Promise<string | undefined> => {
  if (!editionKey) return undefined;
  const edition = EditionSchema.parse(await fetchJson(`${OPEN_LIBRARY_URL}/books/${editionKey}.json`));
  return pickIsbn([...edition.isbn_13, ...edition.isbn_10]);
};

const downloadCover = async (options: { coverId: number; path: string }): Promise<void> => {
  const { coverId, path } = options;
  const coverUrl = `${COVERS_URL}/${coverId}-L.jpg`;
  const response = await fetch(coverUrl, { signal: AbortSignal.timeout(COVER_DOWNLOAD_TIMEOUT_MS) }).catch(() => {
    throw new Error(`Couldn't reach ${coverUrl} (Open Library covers are hosted on archive.org, which may be down). Save a cover yourself and rerun with --cover <file>.`);
  });
  if (!response.ok) {
    throw new Error(`Cover download failed (${response.status}) for cover ${coverId}`);
  }
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
};

const saveCover = async (options: { coverFile?: string; coverId?: number; path: string }): Promise<void> => {
  const { coverFile, coverId, path } = options;
  if (coverFile) return copyFile(coverFile, path);
  if (coverId === undefined) throw new Error('No cover available.');
  return downloadCover({ coverId, path });
};

const todayIsoDate = (): string => new Date().toLocaleDateString('en-CA');

const addBook = async (argv: readonly string[]): Promise<void> => {
  const bookArguments = parseBookArguments(argv);
  const match = await searchOpenLibrary(bookArguments);

  if (match.cover_i === undefined && !bookArguments.cover) {
    throw new Error(`Open Library has no cover for "${match.title}". Rerun with --cover <file>.`);
  }

  const slug = slugify(match.title);
  const contentPath = `${BOOKS_CONTENT_DIR}/${slug}.md`;
  const coverPath = `${BOOK_COVERS_DIR}/${slug}.jpg`;

  if (existsSync(contentPath) || existsSync(coverPath)) {
    throw new Error(`${contentPath} or ${coverPath} already exists. Not overwriting.`);
  }

  const isbn = (await fetchCoverEditionIsbn(match.cover_edition_key)) ?? pickIsbn(match.isbn) ?? '';
  const book: BookEntry = {
    title: match.title,
    author: match.author_name.join(', ') || bookArguments.author || 'Unknown',
    quote: bookArguments.quote,
    date: todayIsoDate(),
    isbn,
    rating: bookArguments.rating,
    slug,
  };

  await saveCover({ coverFile: bookArguments.cover, coverId: match.cover_i, path: coverPath });
  await writeFile(contentPath, toFrontmatter(book));

  console.log(`Added "${book.title}" by ${book.author} (ISBN ${book.isbn || 'missing'})`);
  console.log(`  ${contentPath}\n  ${coverPath}`);
  if (!book.isbn) console.warn('No ISBN found. Add one to the file, or the build will fail.');
  console.log('Double-check the match, then commit.');
};

if (import.meta.main) {
  addBook(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
