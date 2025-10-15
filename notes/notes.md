# Portfolio Website - Next Steps

## Completed ✓
- Header component with navigation and active page indicators
- PageLayout with proper margins (max-w-3xl, px-4 mobile, px-14 desktop)
- ContentLayout with same margins as PageLayout
- Raleway font with heavier weight (450)
- Public folder structure for images
- Project structure planning

## Next Steps

### 1. Content Collections Setup
- [x] Create `src/content/config.ts` with Zod schemas for all collections
  - Define schema for projects (title, date, description, thumbnail, etc.)
  - Define schema for tech writing
  - Define schema for books writing
  - Define schema for life writing
- [ ] Create sample content files to test with
  - 4-5 sample projects in `src/content/projects/`
  - 4-5 sample tech posts in `src/content/tech/`
  - 4-5 sample books posts in `src/content/books/`
  - 4-5 sample life posts in `src/content/life/`

### 2. Core Components (Build in this order)

#### ContentCard.astro
- Display individual content preview card
- Props: title, excerpt, date, slug, thumbnail, collection type
- Responsive design (different sizing for mobile/desktop)
- Hover effects

#### ContentPreviewGrid.astro
- Reusable grid component
- Props: collection items, section title, "view more" link, display count
- Shows last 4 items on desktop, 3 on mobile
- Includes "view more [section]" button at bottom
- Uses ContentCard internally

#### FullContentList.astro
- Displays all items in chronological order
- Props: collection items, page title
- Pagination support (keep in mind for future)
- Uses ContentCard internally

#### AboutSection.astro
- Profile photo on left/top
- Bio text on right/bottom
- Responsive layout (stack on mobile)

#### Footer.astro
- Copyright with name
- Social media links (GitHub, LinkedIn, Twitter, etc.)
- Same max-w-3xl and padding as other layouts

### 3. TypeScript Utility Files
Create separate .ts files for logic (per Astro guidelines):

- [ ] `src/utils/content-helpers.ts`
  - Function to get last N items from collection
  - Function to sort by date
  - Function to merge multiple collections chronologically

- [ ] `src/utils/date-helpers.ts`
  - Format date for display
  - Sort by date functions

### 4. Pages Implementation

#### Home Page (index.astro)
- [ ] Update to use PageLayout
- [ ] Add ContentPreviewGrid for projects (last 4)
- [ ] Add ContentPreviewGrid for all writing combined (last 4)
- [ ] Add AboutSection at bottom
- [ ] Wire up with real content collections

#### Writing Hub (writing/index.astro)
- [ ] Create page with PageLayout
- [ ] Add ContentPreviewGrid for tech (last 4)
- [ ] Add ContentPreviewGrid for books (last 4)
- [ ] Add ContentPreviewGrid for life (last 4)
- [ ] Each with "view more" buttons

#### List Pages
- [ ] `projects/index.astro` - All projects with FullContentList
- [ ] `writing/tech/index.astro` - All tech posts
- [ ] `writing/books/index.astro` - All books posts
- [ ] `writing/life/index.astro` - All life posts
- [ ] `writing/all/index.astro` - All writing combined (merged collections)

#### Individual Content Pages (Dynamic Routes)
- [ ] `projects/[slug].astro` - Individual project page
- [ ] `writing/tech/[slug].astro` - Individual tech post
- [ ] `writing/books/[slug].astro` - Individual book post
- [ ] `writing/life/[slug].astro` - Individual life post

### 5. Styling & Polish
- [ ] Ensure consistent spacing between sections
- [ ] Add smooth transitions and hover effects
- [ ] Test mobile responsiveness thoroughly
- [ ] Add loading states if needed
- [ ] Optimize images

### 6. Testing & Content
- [ ] Test all navigation flows
- [ ] Test active page indicators on all pages
- [ ] Add real content and images
- [ ] Test with different content lengths
- [ ] Cross-browser testing

## Design Notes
- Header margin: max-w-3xl with px-14 on desktop, px-4 on mobile
- All content uses same max-width to align with header
- Font: Raleway weight 500 for body
- Active page indicator: 60% width, centered, 1px underline
- Hover color: gray-400 for both text and underline

## Recommended Build Order
1. Content collections config + sample content
2. ContentCard component
3. ContentPreviewGrid component
4. Home page with projects and writing previews
5. AboutSection component
6. Footer component
7. FullContentList component
8. All list pages
9. Writing hub page
10. ContentLayout styling
11. Individual content pages (dynamic routes)