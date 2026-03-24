# Project Guidelines

## Overview

Personal art portfolio built with [Zola](https://getzola.org) static site generator using the vendored **Zallery** theme (`themes/zallery/`). Images stored in Cloudflare R2, content managed via Sveltia CMS, deployed on Cloudflare Pages.

## Architecture

| Service | Domain | Purpose |
|---------|--------|---------|
| Cloudflare Pages | `artishchow.com` | Static site hosting, auto-deploys from `main` |
| Cloudflare R2 | `images.artishchow.com` | Image storage (CDN automatic via custom domain) |
| Sveltia CMS | `artishchow.com/admin/` | Git-based CMS with native R2 integration |

### Key directories

- `content/artwork/<slug>/index.md` — artwork posts (TOML frontmatter)
- `themes/zallery/` — vendored theme with custom modifications for remote images
- `static/admin/` — Sveltia CMS (index.html, config.yml)

## Build and Test

```bash
zola serve          # Local dev with hot reload (http://127.0.0.1:1111)
zola build          # Production build (outputs to ./public/)
zola check          # Link checking
```

## Image Handling

Theme templates (`thumbnail.html`, `img.html` shortcode) have if/else branches:
- If `thumbnail` or `src` starts with `http` → use URL directly (remote R2 image)
- Otherwise → use Zola's `resize_image()` / `get_image_metadata()` (colocated local file)

Both paths coexist. Existing posts use local files, new posts use R2 URLs.

## Conventions

- Artwork must be in `content/artwork/` for prev/next navigation (`page.lower`/`page.higher`)
- `content/artwork/_index.md` has `transparent = true` — artwork appears at root URL
- Thumbnail images are 800x800, generated manually on phone before upload
- Image filenames: `YYYYMMDD_DN_Description.jpg` (e.g., `20251119_D4_Kasasagi.jpg`)
- Config in `config.toml` under `[extra]`: `r2_public_url`, gallery settings, image processing settings
