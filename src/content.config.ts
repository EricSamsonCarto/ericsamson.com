import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: z.string().optional(),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
});

const booksCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    quote: z.string(),
    date: z.date(),
    ISBN: z.string(),
    thumbnail: z.string().optional(),
  }),
});

const techCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tech' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: z.string().optional(),
    github: z.string().url().optional(),
  }),
});

const lifeCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/life' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: z.string().optional()
  }),
});

export const collections = {
  projects: projectsCollection,
  tech: techCollection,
  books: booksCollection,
  life: lifeCollection,
};
