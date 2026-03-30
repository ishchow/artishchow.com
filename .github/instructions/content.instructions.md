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
date = 2024-11-01
weight = 1
[taxonomies]
tags = ["Tag1", "Tag2"]
years = ["2024"]
[extra]
day_number = 17
thumbnail = "https://images.artishchow.com/YYYYMMDD_DN_Title_thumbnail.webp"
+++

{{ img(src="https://images.artishchow.com/YYYYMMDD_DN_Title.webp", alt="Description") }}
```

## Rules

- Posts are flat files at `content/artwork/<slug>.md`
- Use top-level integer `weight` frontmatter on every artwork post
- Store the custom day index in `[extra].day_number` so the artwork template can render it directly without duplicating `weight`
- Preserve existing artwork slugs as-is; new CMS-created artwork slugs use `YYYYMMDD-dN-W-title` (e.g., `20260312-d19-1-doux`)
- TOML frontmatter with `+++` delimiters
- `description` is optional and should be used for real notes, not for repeated placeholders like `Day X artwork`
- `years` in `[taxonomies]` should match the post date year; Sveltia CMS fills this automatically on save
- `thumbnail` in `[extra]` — full R2 URL to an 800×800 WebP thumbnail
- Body images use `{{ img(src="...", alt="...") }}` shortcode, optionally with `text="Caption"`
- Reference images: `{{ img(src="...", alt="...", text="Reference") }}`
- `crossorigin="anonymous"` is added automatically by the template for remote images

## Sveltia CMS (`static/admin/`)

- `config.yml` — collection config, GitHub backend, editorial workflow
- `index.html` — entry point loading Sveltia CMS from CDN, with:
  - `preSave` hook: auto-prepends `https://images.artishchow.com/` to bare thumbnail filenames
  - `preSave` hook: auto-derives `taxonomies.years` from the post date
  - `preSave` hook: normalizes integer `day_number` and `weight` values, persists `day_number` into `[extra]`, removes the temporary top-level `day_number`, and defaults `weight` to `1`
  - `registerEditorComponent`: "R2 Image" toolbar button for `{{ img() }}` shortcodes (also auto-prepends R2 URL)
- Format: `toml-frontmatter` in collection config
- Auth: GitHub PAT (no OAuth app needed)

## Mobile workflow

1. Upload original + thumbnail (800x800) to R2 via Cloudflare Dashboard
2. Open `artishchow.com/admin/`, sign in with GitHub PAT
3. Create post — enter `day_number`, leave `weight = 1` unless this is an additional same-day post, and enter just the filename for thumbnail
4. Use "R2 Image" toolbar button for body images (also auto-prepends R2 URL)
5. Save → creates PR (editorial workflow) → merge to deploy
