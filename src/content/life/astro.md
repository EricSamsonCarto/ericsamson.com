---
title: "Astro"
description: "Testing out the new(ish) optimized web framework"
date: 2025-10-08
thumbnail: "/public/images/writing/tech/astro.jpg"
---

Not another framework! This one is awesome, I promise. The website you are on right now was built with it. Now that I have used it for a few different projects, I don’t think I could ever go back.

I was first introduced to it a couple years ago from a [**ThePrimeagen video](https://www.youtube.com/watch?v=Sqp5VSqbQOY).** I was intrigued, but didn’t have the bandwidth or any reason to give it a shot. Then my parents decided to start a business. They asked if I could create a website for them. All of a sudden I had a good reason to take Astro for a spin on a simple project. I loved it so much I re-built my personal website from the ground up using Astro.

Astro is essentially a static site generator, similar to Jekyll and Eleventy. Super handy for creating blogs or simple marketing sites, like [my parents site](http://samsonfoot.com) or this site. It’s completely UI agnostic, which means you can use React, Vue, Svelte, whatever, but my site is just astro, typescript, and tailwind.

### Install and Set Up

There are a lot of [themes](https://astro.build/themes/) available that can help you get started quickly, but I personally like to start with a blank canvas. Open up a terminal and run:

```jsx
npm create astro@latest
```

It will give you a short list of starter templates to choose from. If you are like me and want to start from scratch, choose the “minimal (empty)” template. It will also ask you to install dependencies  and to initialize a git repository, I would say yes to both.

It will create the general file/folder structure you will want to use for an astro project. To launch a server and test your current project, just run:

```jsx
npm run dev
```

And then follow the link it gives you to see the current version you are working on.

### Island Architecture

What makes creating with Astro so fast and organized is what they call [“Islands”](https://docs.astro.build/en/concepts/islands/). This allows you to separate parts of your code into individual components (like header, footer, an image carrousel etc.), and then slot those individual components into an existing page or layout, reducing the amount of code you have on one page and ensuring everything stays consistent in other pages. Of course, other frameworks have the similar concepts and functionality, but I find the way Astro handles it incredibly intuitive.

For example, if I wanted to create a re-usable header and footer component, I would create a folder called components, and create two .astro files: one called Header.astro and one called Footer.astro. Then I would create my header and footer code directly in their respective files, including any typescript/javascript I might need. For future layout pages, all I need to do is utilize FrontMatter (javascript code at the top of an .astro file) to import the header within the layout. Now whenever I use the layout for a future page, the page will automatically use our header. Our header only exists in one location; when I update the Header.astro file it will be updated everywhere else:

```jsx
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Samson Foot and Ankle" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body>
    <Header />
    <main>
      <div>
        <slot />
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  @import '../styles/global.css';
</style>
```

The code at the top of my layout is the FrontMatter. This allows me to call to my Header and Footer components and add them directly to the page. The “slot” tag within the main div is where the specific page’s content will end up going.

(I am using tailwind for this project, so that’s what the import is doing within the style tag)

### Content Collection

My favorite thing about astro: you can write all of your blog posts in markdown, and easily iterate through them to display on a main page. There’s a couple of ways you can do this, but here is how I have it set up:

In the src folder, add a folder called content, then within that folder, create a folder called “blog”, or “posts” or whatever you want to call it. Since I am using typescript, I created a file called config.ts within the content folder:

```jsx
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('Eric Samson'),
    image: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
```

In the config file, I am defining the content collection we will be using, and the required/optional attributes we will need for each blog. This will validate the structure set up in each blog post.

Now within the blog folder in the content folder, we can add markdown files for every post we want to write, for example, here is an md file called “example-blog-post.md”:

```jsx
---
title: "Example Blog Post"
description: "Something to reference later"
publishDate: 2025-05-02
author: "Eric Samson"
image: "/blog/example-blog-post/temp-img.jpg"
---

# Example

paragraph

## smaller header

**italics
```

In the layouts folder, I have a BlogLayout.astro, that I can use to slot in any markdown file. Within the pages folder, I have a blog folder. Within that I have a file called [slug].astro. This is where the magic happens:

```jsx
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import ContentLayout from '../../layouts/BlogLayout.astro';

export interface Props {
  post: CollectionEntry<'blog'>;
}

// get all blog posts
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post: CollectionEntry<'blog'>) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post }: Props = Astro.props;
const { Content } = await post.render();

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
---

<ContentLayout title={`${post.data.title}`}>
  <div>
    <header>
      <!-- image -->
      {post.data.image && (
          <Image
            src={post.data.image}
            alt={post.data.title}
            width={800}
            height={400}
          />
       )}

      <!-- title -->
      <h1>
        {post.data.title}
      </h1>

      <!-- information -->
      <div>
        <div>
          <time>{formatDate(post.data.publishDate)}</time>
        </div>

        <div>
          <span>{post.data.author}</span>
        </div>
      </div>
      <!-- blog desc -->
      <p>
        {post.data.description}
      </p>
    </header>
    <!-- content -->
    <article>
      <Content />
    </article>
  </div>
</ContentLayout>
```

Using this slug file, blog pages are automatically created by iterating through each of our md files, taking the attributes we set at the top of them, and displaying it in the structure above. We use the <Content /> tag to load in the main part of the markdown. I could optimize this a bit more, and have a layout within a layout, but you get the idea. In the example above, a route is automatically created at: /blog/example-blog-post. Now whenever I add a markdown file within the content folder, I will have a new page automatically added to my website formatted in the way I want them to be in.

This removes roadblocks on my path to writing and posting. I can jot down some notes within notion, export it as a markdown file, add it to my folder with attributes and I am done. All of a sudden I have just published a new post on my site.

But how do we display these blog posts? Good question. I have an index.astro file within the blog folder under pages that creates cards to display the blog posts. We use front matter to iterate through these:

```jsx
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import ContentLayout from '../../layouts/ContentLayout.astro';

// get blogs and sort them by date, newest first
const allPosts = await getCollection('blog');

const sortedPosts = allPosts.sort((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
  new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
---

<ContentLayout title="example">
  <div>
    <div>
      <h1>Blog</h1>
    </div>

    <!-- grid -->
    <div>
      {sortedPosts.map((post: CollectionEntry<'blog'>) => (
        <article>
          <!-- main image -->
          {post.data.image && (
            <div>
              <a href={`/blog/${post.slug}`} class="block">
                <Image
                  src={post.data.image}
                  alt={post.data.title}
                  width={600}
                  height={400}
                />
              </a>
            </div>
          )}

          <!-- content -->
          <div>
            <!-- date -->
            <time>
              {formatDate(post.data.publishDate)}
            </time>

            <!-- title -->
            <h2>
              <a href={`/blog/${post.slug}`}>
                {post.data.title}
              </a>
            </h2>

            <!-- desc -->
            <p>
              {post.data.description}
            </p>

            <!-- author -->
            <div>
              <span>
                By {post.data.author}
              </span>

              <a
                href={`/blog/${post.slug}`}
              >
                Read More →
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>

    <!-- for no posts, no longer needed but keep -->
    {sortedPosts.length === 0 && (
      <div>
        <h2>No blog posts yet</h2>
        <p>Check back soon for insights and stories!</p>
      </div>
    )}
  </div>
</ContentLayout>
```

There is much, much more, but the reasons above are enough for me to use Astro.