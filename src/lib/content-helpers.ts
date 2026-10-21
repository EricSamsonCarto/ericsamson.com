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

