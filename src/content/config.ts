import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
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
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    thumbnail: z.string().optional()
  }),
});

const lifeCollection = defineCollection({
  type: 'content',
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
