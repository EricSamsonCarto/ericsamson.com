# ericsamson.com

My personal space for projects, writing, and exploring how data gets visualized on maps.

## What's Here

**Projects** – Maps and geospatial applications I've built, mostly centered around data visualization and analysis.
**Writing** – Three categories:
- **Tech** – Documenting technologies I'm working with and learning from
- **Life** – Thoughts on travel, outdoor activities, and other stuff worth writing about
- **Books** – What I've read, with a quote and rating.

## Stack

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). Hosted on Cloudflare.

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:4321` in your browser.

To build for production:
```bash
npm run build
```

## Quick Reference

### Add a book

```bash
npm run add-book -- --title "Dune" --rating 5 --quote "I must not fear."
```

- Wrong match? Add `--author "Frank Herbert"`.
- No cover / covers site down? Add `--cover ./cover.jpg`.
- Creates `src/content/books/<slug>.md` + cover. Edit the `date` (finished date) if needed.

### Add an article

New file in `src/content/<projects|tech|life>/my-slug.mdx`:

```mdx
---
title: "Title"
description: "One line."
date: 2026-10-21
thumbnail: "../../assets/images/writing/tech/my-thumb.jpg"
---

Text here.
```

- URL is the filename: `/writing/tech/my-slug`, `/projects/my-slug`.
- Projects can also have `link:` and `github:`.

### Add an image

1. Put it in `src/assets/images/...` (not `public/`).
2. In an `.mdx` file:

```mdx
import ContentImage from '../../components/ContentImage.astro';

<ContentImage src="writing/tech/my-image.jpg" alt="Description" />
```

- Path is relative to `src/assets/images/`.
- Link to full size: `<FullSizeLink src="writing/tech/my-image.jpg">full size</FullSizeLink>` (import from `../../components/FullSizeLink.astro`).
- WebP conversion and resizing happen automatically on build.

### Checks

```bash
npm run check   # types
npm test        # add-book script
```
