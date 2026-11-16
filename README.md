# smantii.github.io

Personal website of Simone Manti, live at **https://smantii.github.io**.

A custom Jekyll theme called **The Strait**: every page opens on a live view of the Sicilian coast seen
from Reggio Calabria, at dawn in the light theme and at night in the dark one, with the Fata Morgana
rising when the air is still. There is no CSS framework and no jQuery, just `assets/css/main.css`,
`assets/js/site.js` and `assets/js/strait.js`. GitHub Actions builds and deploys the site on every push to `main`.

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

The home page is laid out like a game menu screen. Everything above the bio is front matter in `_pages/about.md`:

```yaml
eyebrow: Machine Learning Engineer          # the slanted label above the headline
status: Open to ML roles                    # the line with the green marker next to it (optional)
headline: Turning data into models that <em>ship</em>.   # <em> = cyan highlight block
intro: >-
  One short paragraph. It is typed into the dialogue box under the headline.
facts:                                      # the rows of the status sheet in "About"
  - label: Role
    value: Machine Learning Engineer
menu:                                       # the section links on the water in the hero
  - title: About                            # each id is a section of the home page:
    id: about                               # about | focus | research | writing | news | contact
    hint: Who I am and where I have worked. # tooltip of the link                  
focus:                                      # the four "What I work on" cards
  - title: End-to-end ML Systems
    icon: pipeline                          # pipeline | wave | tree | agent (see doodle.liquid)
    text: One or two sentences.
    tags: [Pipelines, PyTorch]
```

The bio is the Markdown below the front matter. Wrapping a word in `<em>` inside any headline
(`.display` or `.h2`) sets it in red italics. The three counters in "About"
(publications, projects, posts) are counted from the site's data.

The home page has its own files, loaded only there: `_layouts/home.liquid` and `assets/css/home.css`.

In `_config.yml`:

- `nav`: the menu.
- `contact_note`: the sentence under the headline of the "Contact" section.
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
Set `card:` to a wide picture (about 3:1) to show it on the post's card on the home page and the blog index.
Code blocks get a copy button.

### Translations

Put a translated post in `_translations/` with `lang:` (e.g. `it`), its own `permalink:`
(e.g. `/blog/2026/my-post-title/it/`), and the same `ref:` as the original, which also needs `lang: en`
and that `ref:`. Both pages then show an **EN / IT** switch in the header, and the translation stays
out of the blog list, the home page and the RSS feed. Interface strings (dates, "min read", buttons)
live in `_data/i18n.yml`.

Tip: put a post in `_drafts/` (no date in the filename) to preview it locally with `--drafts` without publishing it.

## Publications

Each BibTeX entry can carry extra fields used by the site, which are hidden from the copyable BibTeX:

- `venue={J. Comput. Phys.}`: the short label shown above the title
- `html=` (publisher page, shown as **Paper**), `pdf=`, `arxiv=`, `code=`: link buttons
- `preview={file.png}`: image from `assets/img/publication_preview/`
- `selected={true}`: also show it on the home page

## Motion

- **The Strait** (`assets/js/strait.js`): one WebGL fragment shader draws the sky, the sea, the coast and
  its reflection behind the hero and every page title. `_includes/sky.liquid` places it; the CSS variable
  `--sea-h` on the surrounding box sets the height of the sea.
- **The mirage**: while the mouse rests, the houses stretch into towers; moving the mouse is wind and
  dissolves them. On touch screens the mirage stays on.
- **Dawn and night**: the theme toggle changes the time of day. At night the moon is in today's real phase.
- **Page transitions** are a native cross-fade (`@view-transition` in `main.css`).

Visitors with "reduce motion" enabled get a single still frame. Without WebGL, a CSS gradient of the
same sky and sea is shown.

## Gotchas

- **Changing the logo:** the header and footer mark is the letter in `.brand-mark` (`_includes/header.liquid`
  and `footer.liquid`). `apple-touch-icon.png` and `favicon.svg` are the icons; keep them square.
- **Portrait:** keep the name `website_profile.jpg`. If you change its proportions, update `width`/`height` in `_layouts/home.liquid`.
- **CSS is not minified on purpose:** the build's minifier breaks `calc()` expressions, so `assets/css/*.css` is excluded in `_config.yml`.
- **HTML-heavy pages are `.html`, not `.md`** (`blog.html`, `projects.html`, `publications.html`), because Markdown mangles nested HTML.

## Running locally

```bash
docker compose up        # then open http://localhost:8080
```

or, with Ruby 3.x installed: `bundle install && bundle exec jekyll serve`.
