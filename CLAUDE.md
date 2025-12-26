# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and gallery website built with [Zola](https://getzola.org), a fast static site generator written in Rust. The site uses the **Zallery** theme, which is designed specifically for showcasing artwork, photography, and creative portfolios.

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

### Working with Content
```bash
# Create a new Zola project (not needed for existing project)
zola init

# Generate shell completion
zola completion
```

## Architecture and Structure

### Directory Layout
- **`config.toml`** - Main site configuration (base_url, theme settings, custom variables)
- **`content/`** - Markdown content files for artwork/posts
- **`templates/`** - Custom template overrides (if needed)
- **`sass/`** - Custom SCSS for theme customization
- **`static/`** - Static assets served as-is
- **`images/`** - Artwork images (JPG format)
- **`themes/zallery/`** - The Zallery theme submodule

### Content Organization

Content follows Zola's page/section model:
- Each artwork piece must be in `content/artwork/<slug>/index.md` (not directly in `content/`)
- Images for each artwork should be colocated with the `index.md` file
- The `content/artwork/_index.md` has `transparent = true` which makes artwork appear at the root URL
- Gallery pages are automatically generated from the `_index.md` files in sections
- **Important**: Artwork must be in the `artwork/` subdirectory for prev/next navigation to work (`page.lower` and `page.higher` variables)

### Artwork Content Structure

Each artwork post uses TOML frontmatter:
```toml
+++
title = "Artwork Title"
description = "Description with markdown support"
date = 2024-11-01
[taxonomies]
tags = ["Tag1", "Tag2"]
[extra]
thumbnail = "image.jpg"  # Used for gallery thumbnails and cover images
modelviewer = true       # Enable for 3D models (optional)
+++
```

### Theme Configuration

The Zallery theme is configured through `[extra]` section in `config.toml`:

- **Navigation**: `menu` array defines header links
- **Gallery settings**: `thumbnail_size`, `thumbnail_format`, `thumbnail_quality`
- **Image processing**: `covert_images`, `create_mobile_images`, `image_format`, `image_quality`
- **JavaScript features**: `modelviewer`, `jszoom`, `goatcounter`
- **Appearance**: `theme_color`, `cover_image`, `hide_copyright`, `hide_poweredby`

### Available Shortcodes

Zallery provides specialized shortcodes for rich media content:

1. **`img`** - Enhanced image display with automatic conversion and mobile optimization
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

- Current images are in JPG format in the `images/` directory
- Image filenames follow pattern: `YYYYMMDD_DN_Description.jpg` (e.g., `20251119_D4_Kasasagi.jpg`)
- When creating artwork posts, images should be colocated with the markdown file in the content directory
- The `thumbnail` field in frontmatter specifies which image to use for gallery view

## Git Information

This repository is not currently a git repository. Version control should be initialized if collaboration or backup is needed.
