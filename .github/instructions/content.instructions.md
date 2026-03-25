---
description: "Use when creating or editing artwork posts, working with Zola content, or modifying Sveltia CMS config. Covers content structure, frontmatter format, image URLs, and shortcodes."
applyTo: "content/artwork/**"
---
# Content Authoring

## Post format

All images are hosted on Cloudflare R2 (`https://images.artishchow.com/`).

```toml
+++
title = "Artwork Title"
description = "Description with markdown support"
date = 2024-11-01
[taxonomies]
tags = ["Tag1", "Tag2"]
[extra]
thumbnail = "https://images.artishchow.com/YYYYMMDD_DN_Title_thumbnail.webp"
+++

{{ img(src="https://images.artishchow.com/YYYYMMDD_DN_Title.webp", alt="Description") }}
```

## Rules

- Posts are flat files at `content/artwork/<slug>.md`
- Slug format: `YYYYMMDD-dN-title` (e.g., `20260312-d19-doux`)
- TOML frontmatter with `+++` delimiters
- `thumbnail` in `[extra]` — full R2 URL to an 800×800 WebP thumbnail
- Body images use `{{ img(src="...", alt="...") }}` shortcode, optionally with `text="Caption"`
- Reference images: `{{ img(src="...", alt="...", text="Reference") }}`
- `crossorigin="anonymous"` is added automatically by the template for remote images

## Sveltia CMS (`static/admin/`)

- `config.yml` — collection config, GitHub backend, editorial workflow
- `index.html` — entry point loading Sveltia CMS from CDN, with:
  - `preSave` hook: auto-prepends `https://images.artishchow.com/` to bare thumbnail filenames
  - `registerEditorComponent`: "R2 Image" toolbar button for `{{ img() }}` shortcodes (also auto-prepends R2 URL)
- Format: `toml-frontmatter` in collection config
- Auth: GitHub PAT (no OAuth app needed)

## Mobile workflow

1. Upload original + thumbnail (800x800) to R2 via Cloudflare Dashboard
2. Open `artishchow.com/admin/`, sign in with GitHub PAT
3. Create post — enter just the filename for thumbnail, full URL auto-prepended on save
4. Use "R2 Image" toolbar button for body images (also auto-prepends R2 URL)
5. Save → creates PR (editorial workflow) → merge to deploy
