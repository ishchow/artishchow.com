---
description: "Use when creating or editing artwork posts, working with Zola content, or modifying Decap CMS config. Covers content structure, frontmatter format, image URLs, and shortcodes."
applyTo: "content/artwork/**"
---
# Content Authoring

## New posts (R2 images)

```toml
+++
title = "Artwork Title"
description = "Description with markdown support"
date = 2024-11-01
[taxonomies]
tags = ["Tag1", "Tag2"]
[extra]
thumbnail = "https://images.artishchow.com/thumbnail.webp"
+++

{{ img(src="https://images.artishchow.com/original.jpg", alt="Description") }}
```

## Existing posts (colocated images)

```toml
+++
title = "Artwork Title"
[extra]
thumbnail = "image.jpg"
+++

{{ img(src="image.jpg", alt="Description") }}
```

## Rules

- Posts must be at `content/artwork/<slug>/index.md` — required for prev/next navigation
- TOML frontmatter with `+++` delimiters
- `thumbnail` in `[extra]` — either a full R2 URL or a colocated filename
- Body images use `{{ img(src="...", alt="...") }}` shortcode, optionally with `text="Caption"`
- Reference images: `{{ img(src="...", alt="...", text="Reference") }}`

## Decap CMS (`static/admin/`)

- `config.yml` — collection config, GitHub backend, R2 media library settings
- `r2-media.js` — custom media library widget that uploads to `upload.artishchow.com`
- `index.html` — entry point loading Decap CMS from CDN
- Format: `toml-frontmatter` in collection config

## Mobile workflow

1. Resize image to 800x800 for thumbnail on phone
2. Open `artishchow.com/admin/`, log in via GitHub
3. Upload original + thumbnail to R2 via media library
4. Create post with R2 URLs
5. Publish → Decap commits to GitHub → Cloudflare Pages auto-deploys
