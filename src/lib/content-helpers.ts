type DatedEntry = { data: { date: Date } };

/**
 * Sorts collection entries by date in descending order (newest first)
 */
export function sortByDate<T extends DatedEntry>(items: readonly T[]): T[] {
  return items.toSorted((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

/**
 * Gets the latest N items from a collection, sorted by date
 */
export function getLatest<T extends DatedEntry>(items: readonly T[], count: number): T[] {
  return sortByDate(items).slice(0, count);
}

/**
 * Filters and sorts multiple collections by date
 */
export function combineAndSortCollections<T extends DatedEntry>(...collections: readonly T[][]): T[] {
  const combined = collections.flat();
  return sortByDate(combined);
}
