// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinksPlugin } from './src/lib/external-links.ts';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: satteri({ hastPlugins: [externalLinksPlugin] }),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});