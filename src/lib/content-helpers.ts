import type { CollectionEntry } from 'astro:content';

/**
 * Sorts collection entries by date in descending order (newest first)
 */
export function sortByDate<T extends 'projects' | 'tech' | 'books' | 'life'>(
  items: CollectionEntry<T>[]
): CollectionEntry<T>[] {
  return items.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

/**
 * Gets the latest N items from a collection, sorted by date
 */
export function getLatest<T extends 'projects' | 'tech' | 'books' | 'life'>(
  items: CollectionEntry<T>[],
  count: number
): CollectionEntry<T>[] {
  return sortByDate(items).slice(0, count);
}

/**
 * Filters and sorts multiple collections by date
 */
export function combineAndSortCollections<T extends 'projects' | 'tech' | 'books' | 'life'>(
  ...collections: CollectionEntry<T>[][]
): CollectionEntry<T>[] {
  const combined = collections.flat();
  return sortByDate(combined);
}
