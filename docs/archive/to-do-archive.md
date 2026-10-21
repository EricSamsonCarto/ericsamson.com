# To-Do Archive

## 2026-10-21

### Fix npm dependency vulnerabilities
- Upgraded Astro 5 → 7, MDX 4 → 8, MapLibre 5 → 6; migrated to `src/content.config.ts` with glob loaders.
- Overrode `postcss-selector-parser` to a patched version (typography plugin hasn't shipped a fix yet).
- `npm audit`: 0 vulnerabilities.

### Image optimization
> Images take far too long to load on the homepage, projects, writing, books pages etc. Convert to webp at multiple sizes per scenario, keep full-size webp where linked.

- Moved all images from `public/images` (and `public/headshot.jpg`) to `src/assets/images` so Astro/sharp processes them at build time. No TinyPNG/API needed.
- Every image is now WebP with a responsive `srcset`: cards 320/640px, content/hero 480–1440px. GIFs become animated WebP.
- Thumbnails use the `image()` schema helper (frontmatter paths are relative: `../../assets/images/...`).
- Inline images: `<ContentImage src="projects/x/y.jpg" alt="..." />` (path relative to `src/assets/images`).
- Full-size links: `<FullSizeLink src="projects/x/y.jpg">text</FullSizeLink>` → full-resolution WebP.
- Image weight (2x desktop): home 3.2 MB → 0.28 MB, projects 3.7 MB → 0.49 MB, writing 2.0 MB → 0.27 MB.

### Books redesign
> Stop writing reviews. 9 books (3 rows) per page; clicking a book opens a pop-up with the cover, quote, ISBN, author and a 5-star rating. Script to resize covers uniformly. Script that takes a title + rating and scrapes the rest.

- The 11 reviews moved to `docs/archive/book-reviews/` (full original files). Book entries in `src/content/books/` are now frontmatter only.
- `/writing/books` is a 3×3 cover grid with pagination. Each cover opens a `<dialog>` (`BookDialog` → `BookDetails` + `StarRating`). Links are shareable: `/writing/books#erasure` opens that book. The writing page previews link there too.
- Individual `/writing/books/<slug>` pages were removed.
- Covers are cropped to a uniform 2:3 (240×360, plus 2x) by Astro at build time, so no separate resize script is needed.
- `npm run add-book -- --title "Dune" --rating 5 --quote "I must not fear." [--author "Frank Herbert"] [--cover ./cover.jpg]`
  - Uses Open Library (LibraryThing is offline): fills in the author and the ISBN of the cover edition, downloads the cover, and writes `src/content/books/<slug>.md`.
  - `--author` helps when a title matches the wrong book. `--cover` uses a local image instead (for when Open Library has no cover, or covers.openlibrary.org / archive.org is down).
  - Won't overwrite an existing book. Tests: `npm test`.

### Tooling added along the way
- `npm run check` (astro check, strict TypeScript): 0 errors. Fixed `sortByDate`, which mutated its input and lost the collection type.

### Books follow-ups
- The pop-up shows a "finished" date, taken from the old "written on" `date`.
- `rating` is now required. The 11 existing books have placeholder random ratings.
- Every cover is cropped to exactly 280×420 and lazy-loaded (fixes uneven heights and the Astro "unoptimized loading attribute" audit warning).
- Fixed dates showing one day early across the site (frontmatter dates are UTC and were being shown in local time).
