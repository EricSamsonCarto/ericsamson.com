# Notion to GitHub Article Automation

## Overview

Automate publishing articles from Notion to the website repository. Write articles directly in Notion with rich formatting, images, and code blocks, then deploy to GitHub with a single GitHub Actions workflow trigger from mobile.

**Workflow:**
1. Write article in Notion with YAML frontmatter at the top
2. Mark article with `deploy: true` in the Notion board
3. Manually trigger GitHub Actions workflow from phone
4. Script validates, processes images, and commits article to repo
5. Mark article with `deployed: true` in Notion

---

## Notion Board Schema

### Columns
| Column | Type | Purpose | Required |
|--------|------|---------|----------|
| Title | Text | Article title | Yes |
| Type | Select | Content type: `books`, `tech`, `projects`, `life` | Yes |
| Article File Name | Text | Explicit filename (e.g., `my-article`) | Yes |
| Deploy | Checkbox | Mark `true` when ready to publish | Yes |
| Requires Update | Checkbox | Mark `true` if article already deployed but needs update | No |
| Deployed | Checkbox | Auto-marked `true` after deployment | Auto |

### Article Structure in Notion

Each Notion page should have YAML frontmatter at the very top, followed by article content:

```
---
title: "Article Title"
type: "tech"
date: 2026-03-14
thumbnail: "photo_1"
description: "Brief description"
photo_1: "Main Photo Name"
photo_2: "Optional Photo Name"
photo_3: "Optional Photo Name"
photo_4: "Optional Photo Name"
---

Article content starts here. Can include markdown, images, code blocks, etc.
```

**Export Settings:** Configure Notion to export as Markdown (use Notion's built-in markdown export feature when retrieving page content).

---

## Required Frontmatter by Content Type

### Books (`type: "books"`)
**Required fields:**
- `title` (string)
- `date` (YYYY-MM-DD)
- `author` (string)
- `quote` (string)
- `ISBN` (string)
- `photo_1` (string) - thumbnail image name

**Example:**
```yaml
---
title: "Abundance"
author: "Ezra Klein, Derek Thompson"
quote: "Whether government is bigger or smaller is the wrong question..."
date: 2026-03-14
ISBN: "9781668023488"
photo_1: "abundance_cover"
---
```

### Tech (`type: "tech"`)
**Required fields:**
- `title` (string)
- `date` (YYYY-MM-DD)
- `photo_1` (string) - thumbnail image name

**Optional fields:**
- `description` (string)
- `photo_2`, `photo_3`, `photo_4` (string)

**Example:**
```yaml
---
title: "Creating a GCP ETL"
description: "Large scale data pipeline tutorial"
date: 2026-03-14
photo_1: "gcp_pipeline"
photo_2: "architecture_diagram"
---
```

### Projects (`type: "projects"`)
**Required fields:**
- `title` (string)
- `date` (YYYY-MM-DD)
- `photo_1` (string) - thumbnail image name

**Optional fields:**
- `description` (string)
- `github` (string) - GitHub repo URL
- `photo_2`, `photo_3`, `photo_4` (string)

### Life (`type: "life"`)
**Required fields:**
- `title` (string)
- `date` (YYYY-MM-DD)
- `photo_1` (string) - thumbnail image name

**Optional fields:**
- `description` (string)
- `photo_2`, `photo_3`, `photo_4` (string)

---

## File Output Structure

### File Path Pattern
```
src/content/{type}/{slug}.md
```

**Slug Generation:**
- Convert `article_file_name` from Notion to kebab-case
- Example: "getting-a-map-published" → `getting-a-map-published.md`

### Image Path Pattern

**Books:** `/public/images/writing/books/{photo_name}.jpg`
**Tech:** `/public/images/writing/tech/{photo_name}.jpg`
**Life:** `/public/images/writing/life/{photo_name}.jpg`
**Projects:** `/images/projects/{slug}/{photo_name}.jpg`

### Frontmatter Output Format

The thumbnail field will be auto-populated based on image path:

```yaml
---
title: "Article Title"
author: "Author Name"  # Books only
quote: "Quote text"    # Books only
date: 2026-03-14
ISBN: "123456789"      # Books only
github: "https://..."  # Projects only
description: "Text"    # Optional for tech/life/projects
thumbnail: "/public/images/writing/{type}/{photo_1}.jpg"
---
```

---

## Image Processing Pipeline

### Image Handling Workflow
1. **Extract images from Notion markdown** — Notion's markdown export includes image URLs
2. **Download images** — Fetch from Notion CDN using image URLs
3. **Convert to JPG** — Convert all formats (PNG, GIF, WebP, etc.) to JPG
4. **Optimize** — Compress to reduce file size while maintaining quality
5. **Save locally** — Save to correct directory based on type and slug
6. **Update markdown references** — Replace Notion image URLs with local paths

### Image Naming Convention
Photos are named in frontmatter:
- `photo_1: "my_cover_image"` → saved as `my_cover_image.jpg`
- `photo_2: "diagram"` → saved as `diagram.jpg`
- etc.

The script maps frontmatter photo names to markdown image references.

### Technical Details
- **Conversion:** Use `Pillow` (PIL) or `imagemagick` for JPG conversion
- **Optimization:** Compress JPG to ~85% quality, max 1920px width
- **Validation:** Verify image downloaded successfully before updating references
- **Error handling:** If image download fails, exit with error

---

## Validation & Error Handling

### Pre-Processing Validation
The script must validate **before** creating any files:

1. ✓ Article exists in Notion with `deploy: true`
2. ✓ YAML frontmatter is valid
3. ✓ All required fields present for article type
4. ✓ `article_file_name` is provided
5. ✓ `type` is one of: `books`, `tech`, `projects`, `life`
6. ✓ `date` is valid YYYY-MM-DD format
7. ✓ `photo_1` is specified
8. ✓ Target file doesn't already exist (unless `requires_update: true`)
9. ✓ All photos referenced in frontmatter can be downloaded

### Error Handling Strategy
- **Missing required fields:** Exit with error message listing missing fields
- **Invalid frontmatter:** Exit with error message and line number
- **File already exists:** Exit with error (prevent overwrites unless updating)
- **Image download fails:** Exit with error (don't create file if images missing)
- **Invalid markdown:** Exit with error (invalid Notion export)

**No partial writes.** If any validation fails, exit cleanly without creating/modifying files.

### Update Workflow
If `requires_update: true`:
1. ✓ Article marked with `requires_update: true` in Notion
2. ✓ File already exists at target path
3. ✓ Validate all fields
4. ✓ Re-download and process images (overwrite old images)
5. ✓ Overwrite markdown file
6. ✓ Mark `requires_update: false` and `deployed: true`

---

## GitHub Actions Workflow

### Trigger
- **Manual dispatch** from GitHub app on phone
- Input: `notion_page_id` (optional — if provided, process single page; otherwise process all with `deploy: true`)

### Workflow Steps
1. Set up Python environment
2. Install dependencies (requests, pillow, pyyaml, notion-client)
3. Run Python script:
   - Fetch article from Notion
   - Validate frontmatter
   - Download and process images
   - Generate markdown file
   - Update Notion status
4. Commit and push to repo (if changes made)
5. Report success/failure

### Workflow File Location
`.github/workflows/publish-from-notion.yml`

---

## Python Script Architecture

### Main Script: `scripts/publish_from_notion.py`

**Modules:**
- `NotionClient` — Query Notion API, fetch pages
- `FrontmatterValidator` — Parse and validate YAML frontmatter
- `ImageProcessor` — Download, convert, optimize images
- `MarkdownGenerator` — Generate final markdown with correct paths
- `ArticlePublisher` — Write file to correct location, commit

**Main Flow:**
```
1. Parse arguments (Notion page ID optional)
2. Query Notion for articles with deploy=true
3. For each article:
   a. Extract frontmatter + content
   b. Validate all fields
   c. Process images
   d. Generate markdown
   e. Write file
   f. Mark deployed in Notion
4. Commit and push
```

---

## Dependencies

**Python packages:**
- `requests` — Download images
- `pillow` — Image conversion/optimization
- `pyyaml` — YAML frontmatter parsing
- `notion-client` — Notion API access

**Environment variables needed:**
- `NOTION_TOKEN` — Notion API token
- `NOTION_DATABASE_ID` — Notion board database ID
- `GITHUB_TOKEN` — (auto-provided by GitHub Actions)

---

## Deployment Checklist

- [ ] Set up Notion board with columns: Title, Type, Article File Name, Deploy, Requires Update, Deployed
- [ ] Create Notion integration and generate API token
- [ ] Store `NOTION_TOKEN` and `NOTION_DATABASE_ID` as GitHub secrets
- [ ] Write Python script with all modules
- [ ] Create GitHub Actions workflow file
- [ ] Test end-to-end with one article
- [ ] Document Notion page format in README

---

## Future Enhancements (Out of Scope)

- Auto-publish on deploy (currently requires manual trigger)
- Auto-generate slugs from title if `article_file_name` missing
- Scheduled syncs instead of manual workflow
- Auto-tag articles based on content
- Preview generation before publishing
