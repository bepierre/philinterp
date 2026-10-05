# PhilInterp

The website of PhilInterp, the Philosophy with Mechanistic Interpretability Network.

## Editing

Everything lives in `src/`:

- `src/index.html`, `src/research.html`, `src/people.html` — the three pages
- `src/works.html` — the research entries (title, authors, text, buttons, figure)
- `src/nav.html`, `src/footer.html` — shared parts
- `src/style.css` — all styles; the palette and type set are tokens at the top
- `src/site.js` — the mark and the interactive figures. Figure text uses two sizes only, `FIG_FS` (regular) and `FIG_FS2` (small), set at the top of the figure code
- `assets/people/` — portraits, one JPEG per person, named like the anchor on the people page

Edit a file in `src/`, commit to `main`, and the site rebuilds and deploys itself within a minute or two (see the Actions tab). Nothing needs to be run locally.

To preview locally: `python3 build.py` writes `index.html`, `research.html`, `people.html` next to this file; open them in a browser.

## Adding a member

1. Add a portrait to `assets/people/first-last.jpg` (portrait orientation, about 900 px tall).
2. Copy one `<div class="person" id="first-last">` block in `src/people.html` and fill it in.
3. In `src/works.html`, wrap the author's name in `<a href="{people}#first-last">…</a>` wherever it appears.
4. Add `first-last` to `data-authors` on each of their papers in `src/works.html`, and add `'first-last':'First Last'` to the `NAMES` map in `src/site.js`, so the Research link on the people page filters to their papers.

## Adding a paper

Copy one `<article class="work">` block in `src/works.html`. A paper without a figure uses `<article class="work nofig">` and no `<figure>`.
