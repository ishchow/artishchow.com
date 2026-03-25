# artishchow.com

Personal art portfolio and gallery by [Ishaat Chowdhury](https://www.ishaat.ca).

Built with [Zola](https://www.getzola.org/) using a vendored [Zallery](themes/zallery/) theme. Images stored in Cloudflare R2, content managed via [Sveltia CMS](https://github.com/sveltia/sveltia-cms), deployed on Cloudflare Pages.

## Architecture

| Service | Domain | Purpose |
|---------|--------|---------|
| Cloudflare Pages | `artishchow.com` | Static site hosting, auto-deploys from `main` |
| Cloudflare R2 | `images.artishchow.com` | Image storage (public bucket) |
| Sveltia CMS | `artishchow.com/admin/` | Git-based CMS with editorial workflow |

## Project Structure

```
config.toml                  # Zola site config
content/artwork/<slug>/      # Artwork posts (TOML frontmatter)
themes/zallery/              # Vendored theme (customized for remote images)
static/admin/                # Sveltia CMS (config.yml + index.html)
sass/                        # Site-level Sass overrides
templates/                   # Site-level template overrides
```

## Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) (static site generator)

## Development

```bash
zola serve    # Local dev server with hot reload → http://127.0.0.1:1111
zola build    # Production build → ./public/
zola check    # Validate internal links
```

## Adding Artwork

Each artwork post lives at `content/artwork/<slug>/index.md` with TOML frontmatter:

```toml
+++
title = "Artwork Title"
description = "Optional description"
date = 2026-03-12
[taxonomies]
tags = ["Tag1", "Tag2"]
[extra]
thumbnail = "https://images.artishchow.com/20260312_D19_Thumbnail.jpg"
+++

{{ img(src="https://images.artishchow.com/20260312_D19_Doux.jpg", alt="Description") }}
```

### Conventions

- **Slug format:** `YYYYMMDD-dN-title` (e.g., `20260312-d19-doux`)
- **Image filenames:** `YYYYMMDD_DN_Description.jpg` (e.g., `20251119_D4_Kasasagi.jpg`)
- **Thumbnails:** 800×800, WebP format

### Image Handling

The theme supports two image sources:

- **Remote (R2):** URLs starting with `http` are used directly
- **Local:** Filenames are processed through Zola's built-in `resize_image()`

New posts use R2 URLs. Older posts with colocated images continue to work.

### Mobile Workflow

1. Upload original + thumbnail to R2 via Cloudflare Dashboard
2. Open `artishchow.com/admin/` and sign in with a GitHub PAT
3. Create a post — the CMS auto-prepends the R2 URL to bare filenames on save
4. Save creates a PR (editorial workflow) — merge to deploy

## License

Content and artwork are &copy; Ishaat Chowdhury. The Zallery theme has its own [license](themes/zallery/LICENSE).