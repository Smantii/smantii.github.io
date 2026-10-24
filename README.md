# smantii.github.io

Personal website of Simone Manti, live at **https://smantii.github.io**.

A custom Jekyll theme inspired by the menus of *Persona 3 Reload*: light blue and navy, cyan highlights,
slanted shapes, halftone dots and lots of motion. There is no CSS framework and no jQuery, just
`assets/css/main.css` and `assets/js/site.js`. GitHub Actions builds and deploys the site on every push to `main`.

## Where things live

| What | File |
| --- | --- |
| Home page: label, headline, intro, facts, focus cards, bio | `_pages/about.md` |
| Publications | `_bibliography/papers.bib` |
| News on the home page | `_news/*.md` |
| CV | `_data/cv.yml` |
| Projects | `_data/repositories.yml` |
| Blog posts | `_posts/YYYY-MM-DD-slug.md` |
| Name, role, socials, navigation, ticker words, contact note | `_config.yml` |
| Portrait | `assets/img/website_profile.jpg` |
| Logo / app icon / favicon | `assets/img/apple-touch-icon.png`, `assets/img/favicon.svg`, `favicon.ico` |
| Styles / scripts | `assets/css/main.css`, `assets/js/site.js` |
| Decorative SVG shapes (sparkle, shard, slash…) | `_includes/doodle.liquid` |

## Editing the home page

Everything above the bio is front matter in `_pages/about.md`:

```yaml
eyebrow: Machine Learning Engineer          # the slanted label above the headline
headline: Turning data into models that <em>ship</em>.   # <em> = cyan highlight block
intro: >-
  One short paragraph under the headline.
facts:                                      # the three boxes under the buttons
  - label: Role
    value: Machine Learning Engineer
focus:                                      # the four "What I work on" cards
  - title: End-to-end ML Systems
    icon: pipeline                          # pipeline | wave | tree | agent (see doodle.liquid)
    color: navy                             # navy | cyan | sky | ice
    text: One or two sentences.
    tags: [Pipelines, PyTorch]
# bubble: Open to work!                     # optional dialogue box on the portrait
```

The bio is the Markdown below the front matter. Wrapping a word in `<em>` inside any headline
(`.display` or `.h2`) gives it the cyan highlight block.

In `_config.yml`:

- `nav`: the menu. Each item has a `color` (`cyan`, `sky`, `ice` or `aqua`) used for its hover state and page transition.
- `ticker`: the words in the two scrolling bands under the hero.
- `contact_note`: the sentence in the "Get in touch" card.
- `cv_pdf`: put your CV at e.g. `assets/pdf/CV_Simone_Manti.pdf` and set this path to show a **Download CV** button on `/cv/`.

## Writing a blog post (the long version of a LinkedIn post)

Create `_posts/2026-11-03-my-post-title.md`:

```markdown
---
title: "My post title"
description: One or two sentences, shown on cards and in link previews.
tags: [machine learning, agents]
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
Blockquotes (`> ...`) render as black Persona-style dialogue boxes, and code blocks get a copy button.

Tip: put a post in `_drafts/` (no date in the filename) to preview it locally with `--drafts` without publishing it.

## Publications

Each BibTeX entry can carry extra fields used by the site, which are hidden from the copyable BibTeX:

- `venue={J. Comput. Phys.}`: the short label shown above the title
- `html=` (publisher page, shown as **Paper**), `pdf=`, `arxiv=`, `code=`: link buttons
- `preview={file.png}`: image from `assets/img/publication_preview/`
- `selected={true}`: also show it on the home page

## Motion

All animations live in `assets/js/site.js` and need no libraries:

- **Vortex flow**: the animated streaklines behind the hero and page titles (a von Kármán vortex street).
- **Page transitions**: clicking an internal link sweeps black, cyan and navy bands across the screen, with the logo and the section name.
- **Headlines** slam in word by word; content slides in from the left as you scroll.
- **Cards** tilt toward the cursor; clicks produce small cyan shard bursts.

Visitors with "reduce motion" enabled get a static version of all of this.

## Gotchas

- **Changing the logo:** `apple-touch-icon.png` is also the header/footer logo and the image in the page transition.
  Keep it square (180×180 or larger). Links to it get a cache-busting hash automatically when the file changes.
- **Portrait:** keep the name `website_profile.jpg`. If you change its proportions, update `width`/`height` in `_layouts/home.liquid`.
- **CSS is not minified on purpose:** the build's minifier breaks `calc()` expressions, so `assets/css/*.css` is excluded in `_config.yml`.
- **HTML-heavy pages are `.html`, not `.md`** (`blog.html`, `projects.html`, `publications.html`), because Markdown mangles nested HTML.

## Running locally

```bash
docker compose up        # then open http://localhost:8080
```

or, with Ruby 3.x installed: `bundle install && bundle exec jekyll serve`.
