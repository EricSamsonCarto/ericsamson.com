import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pickIsbn, slugify, toFrontmatter } from './add-book.ts';

test('slugify makes file-safe slugs', () => {
  assert.equal(slugify('Fahrenheit 451'), 'fahrenheit-451');
  assert.equal(slugify("Children of Time: A Novel!"), 'children-of-time-a-novel');
  assert.equal(slugify('Café Society'), 'cafe-society');
});

test('pickIsbn prefers ISBN-13', () => {
  assert.equal(pickIsbn(['0441172717', '9780441172719']), '9780441172719');
  assert.equal(pickIsbn(['0441172717']), '0441172717');
  assert.equal(pickIsbn([]), undefined);
});

test('toFrontmatter escapes quotes', () => {
  const frontmatter = toFrontmatter({
    title: 'Dune',
    author: 'Frank Herbert',
    quote: 'He said "fear" is the mind-killer.',
    date: '2026-10-21',
    isbn: '9780441172719',
    rating: 5,
    slug: 'dune',
  });
  assert.match(frontmatter, /^quote: "He said \\"fear\\" is the mind-killer\."$/m);
  assert.match(frontmatter, /^rating: 5$/m);
});
