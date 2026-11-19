import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const liveLinkFields = {
  link: z.union([z.string().url(), z.string().startsWith('/')]).optional(),
  linkText: z.string().optional(),
};

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: image().optional(),
    ...liveLinkFields,
    github: z.string().url().optional(),
  }),
});

const booksCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/books' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    author: z.string(),
    quote: z.string(),
    date: z.date(),
    ISBN: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    thumbnail: image(),
  }),
});

const techCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/tech' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: image().optional(),
    ...liveLinkFields,
    github: z.string().url().optional(),
  }),
});

const lifeCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/life' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: image().optional()
  }),
});

export const collections = {
  projects: projectsCollection,
  tech: techCollection,
  books: booksCollection,
  life: lifeCollection,
};
