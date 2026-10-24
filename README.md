# smantii.github.io

Personal website of Simone Manti, live at **https://smantii.github.io**.
A small custom Jekyll theme with no CSS framework and no jQuery, deployed by GitHub Actions on every push to `main`.

## Where things live

| What | File |
| --- | --- |
| Home page (headline, intro, facts, research focus, bio) | `_pages/about.md` |
| Publications | `_bibliography/papers.bib` |
| News on the home page | `_news/*.md` |
| CV | `_data/cv.yml` |
| Projects | `_data/repositories.yml` |
| Blog posts | `_posts/YYYY-MM-DD-slug.md` |
| Name, socials, navigation | `_config.yml` |
| Styles / scripts | `assets/css/main.css`, `assets/js/site.js` |

## Writing a blog post (the long version of a LinkedIn post)

Create `_posts/2026-11-03-my-post-title.md`:

```markdown
---
title: "My post title"
description: One or two sentences, shown on cards and in link previews.
tags: [symbolic regression, scientific ML]
linkedin: https://www.linkedin.com/posts/...   # the original LinkedIn post (optional)
math: true                                     # only if the post uses LaTeX
cover: /assets/img/blog/my-figure.png          # optional wide image under the title
cover_caption: Optional caption.
---

Write in Markdown. Inline math: $E = mc^2$. Display math:

$$
\partial_t \rho + \partial_x (\rho V(\rho)) = 0
$$
```

With `linkedin:` set, the post shows a "long version of a LinkedIn post" banner at the top
and a **Discuss on LinkedIn** button at the end. Posts appear at `/blog/` and in the RSS feed at `/blog/feed.xml`.

Tip: put a post in `_drafts/` (no date in the filename) to preview it locally with `--drafts` without publishing it.

## Publications

Each BibTeX entry can carry extra fields used by the site, which are hidden from the copyable BibTeX:

- `venue={J. Comput. Phys.}`: the short label shown above the title
- `pdf=`, `html=`, `arxiv=`, `code=`: link buttons
- `preview={file.png}`: image from `assets/img/publication_preview/`
- `selected={true}`: also show it on the home page

## Running locally

```bash
docker compose up        # then open http://localhost:8080
```

or, with Ruby 3.x installed: `bundle install && bundle exec jekyll serve`.
