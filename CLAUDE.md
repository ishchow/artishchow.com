# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and gallery website built with [Zola](https://getzola.org), a fast static site generator written in Rust. The site uses the **Zallery** theme (vendored in `themes/zallery/`), designed for showcasing artwork, photography, and creative portfolios.

Images are stored in **Cloudflare R2** (`images.artishchow.com`) and referenced by full URL in content files. Content is managed via **Decap CMS** at `artishchow.com/admin/`. The site is deployed on **Cloudflare Pages** with auto-deploy on push to `main`.

## Development Commands

### Build and Serve
```bash
# Serve the site locally with hot reload (default: http://127.0.0.1:1111)
zola serve

# Build the site for production (outputs to ./public/)
zola build

# Check links and build without rendering
zola check
```

### Deploy Workers
```bash
# Upload Worker (R2 image proxy, protected by Cloudflare Access)
cd workers/upload && npm install && npx wrangler deploy

# OAuth Worker (GitHub OAuth proxy for Decap CMS)
cd workers/oauth && npm install && npx wrangler deploy

# Set OAuth secrets (first time only)
cd workers/oauth
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

## Architecture and Structure

### Directory Layout
- **`config.toml`** - Main site configuration (base_url, theme settings, custom variables)
- **`content/`** - Markdown content files for artwork/posts
- **`templates/`** - Custom template overrides (if needed)
- **`sass/`** - Custom SCSS for theme customization
- **`static/`** - Static assets served as-is
- **`static/admin/`** - Decap CMS (index.html, config.yml, r2-media.js)
- **`themes/zallery/`** - The Zallery theme (vendored, with custom modifications)
- **`workers/upload/`** - Cloudflare Worker for R2 image uploads
- **`workers/oauth/`** - Cloudflare Worker for GitHub OAuth proxy

### Infrastructure

| Service | Domain | Purpose |
|---------|--------|---------|
| Cloudflare Pages | `artishchow.com` | Static site hosting, auto-deploys from `main` |
| Cloudflare R2 | `images.artishchow.com` | Image storage (CDN automatic via custom domain) |
| Upload Worker | `upload.artishchow.com` | R2 upload/list/delete API, protected by Cloudflare Access |
| OAuth Worker | `oauth.artishchow.com` | GitHub OAuth proxy for Decap CMS login |
| Decap CMS | `artishchow.com/admin/` | Git-based content management UI |

### Image Handling

Images are stored in Cloudflare R2 and referenced by full URL. The Zallery theme templates have been modified with if/else branches to handle both:
- **Remote images** (new posts): `thumbnail = "https://images.artishchow.com/thumbnail.webp"` and `{{ img(src="https://images.artishchow.com/original.jpg", alt="...") }}`
- **Colocated images** (existing posts): `thumbnail = "filename.jpg"` — uses Zola's built-in `resize_image()` and `get_image_metadata()`

Modified theme files:
- `themes/zallery/templates/partials/thumbnail.html` — remote URL branch skips `resize_image()`, uses pre-generated thumbnail URL directly
- `themes/zallery/templates/shortcodes/img.html` — remote URL branch skips `get_image_metadata()` and `get_url()`, uses URL directly

Thumbnail generation is done manually (e.g., resize to 800x800 on phone) before uploading to R2. Both the original and thumbnail are uploaded separately.

### Content Organization

Content follows Zola's page/section model:
- Each artwork piece must be in `content/artwork/<slug>/index.md` (not directly in `content/`)
- For existing posts, images are colocated with the `index.md` file
- For new posts, images are in R2 and referenced by full URL
- The `content/artwork/_index.md` has `transparent = true` which makes artwork appear at the root URL
- Gallery pages are automatically generated from the `_index.md` files in sections
- **Important**: Artwork must be in the `artwork/` subdirectory for prev/next navigation to work (`page.lower` and `page.higher` variables)

### Artwork Content Structure

Each artwork post uses TOML frontmatter. New posts use R2 URLs:
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

Existing posts use colocated filenames:
```toml
+++
title = "Artwork Title"
[extra]
thumbnail = "image.jpg"
+++

{{ img(src="image.jpg", alt="Description") }}
```

### Theme Configuration

The Zallery theme is configured through `[extra]` section in `config.toml`:

- **Navigation**: `menu` array defines header links
- **Gallery settings**: `thumbnail_size`, `thumbnail_format`, `thumbnail_quality`
- **Image processing**: `covert_images`, `create_mobile_images`, `image_format`, `image_quality`
- **JavaScript features**: `modelviewer`, `jszoom`, `goatcounter`
- **Appearance**: `theme_color`, `cover_image`, `hide_copyright`, `hide_poweredby`
- **R2**: `r2_public_url` — base URL for R2 image storage

### Available Shortcodes

Zallery provides specialized shortcodes for rich media content:

1. **`img`** - Enhanced image display (supports both local filenames and full URLs)
2. **`video`** - Video embeds with autoplay/loop options
3. **`youtube`** / **`vimeo`** - Video platform embeds
4. **`model`** - 3D model viewer (requires modelviewer enabled)
5. **`sketchfab`** - Sketchfab 3D model embeds

See `themes/zallery/templates/shortcodes/` for implementation details.

### Template Hierarchy

Key templates in `themes/zallery/templates/`:
- **`base.html`** - Base template with HTML structure, meta tags, and navigation
- **`artwork.html`** - Individual artwork display with prev/next navigation
- **`gallery.html`** - Grid view of artwork thumbnails
- **`section.html`** - Section landing pages

### Styling

The theme uses SCSS with a modular structure:
- Theme variables are in `themes/zallery/sass/_variables.scss`
- To customize colors, copy `_variables.scss` to `sass/` and create `sass/zallery.scss` that imports variables and theme files
- Dark/light mode is built into the theme

## Working with Images

### New posts (mobile workflow)
1. Resize image to 800x800 for thumbnail on phone
2. Open Decap CMS at `artishchow.com/admin/`, log in via GitHub
3. Upload original + thumbnail to R2 via the media library
4. Create new artwork post, paste R2 URLs for thumbnail and body images
5. Publish — Decap CMS commits to GitHub, Cloudflare Pages auto-deploys

### Existing posts
- Images colocated in `content/artwork/<slug>/` directory
- Image filenames follow pattern: `YYYYMMDD_DN_Description.jpg`
- The `thumbnail` field in frontmatter specifies which local file to use for gallery view

## Workers

### Upload Worker (`workers/upload/`)
Simple R2 proxy protected by Cloudflare Access (one-time PIN auth):
- `POST /upload` — multipart file upload → stores in R2, returns `{ key, url }`
- `GET /list` — paginated list of R2 objects
- `DELETE /delete/:key` — removes object from R2
- CORS configured for `artishchow.com`

### OAuth Worker (`workers/oauth/`)
GitHub OAuth proxy for Decap CMS authentication:
- `GET /auth` — redirects to GitHub OAuth authorize
- `GET /callback` — exchanges code for token, delivers to Decap CMS via `postMessage`
- Secrets: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (set via `wrangler secret put`)

### Updating Workers
After editing worker source code, redeploy:
```bash
cd workers/upload && npx wrangler deploy
cd workers/oauth && npx wrangler deploy
```
Workers are deployed independently from the Zola site. Changes to worker code do **not** require a site rebuild or git push — just `wrangler deploy`.
