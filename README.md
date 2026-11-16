# Mitsutaka Uehara — Portfolio

Personal portfolio for an IT & cybersecurity student working toward cybersecurity solutions engineering or SOC analyst roles.
Plain HTML, CSS and a little JavaScript. No frameworks, no build step. Hosted on GitHub Pages.

## Files

```
index.html                       The whole site (single page)
style.css                        Design tokens + all styles (light and dark themes)
script.js                        Threshold playground, accordion, theme, menu, copy-email
Mitsutaka_Uehara_resume.pdf      YOUR resume: put it here, next to index.html
portfolio/index.html             Redirects old /portfolio/ links to the Work section
```

> The resume file name must match exactly: `Mitsutaka_Uehara_resume.pdf`.
> (The old README said `resume.pdf`, but the links always pointed to the longer name.)

All links are **relative**, so the site works when you double-click `index.html`
*and* when it's served from GitHub Pages.

## Design

- **Idea:** detection is about separating signal from noise, which is what the ML-IDPS research was about.
  The hero is a small interactive threshold playground (synthetic data) showing the precision/recall trade-off.
- **Colour:** indigo ink on cool paper; one vermilion "signal" colour that only marks detections.
  Dark theme follows the system setting, with a toggle in the header.
- **Type:** Archivo (expanded) for display, Zen Kaku Gothic New for text and 日本語, JetBrains Mono for data readouts.
- **Motion:** one page-load moment (name + dots + threshold sweep). Everything else responds to the visitor.
  `prefers-reduced-motion` is respected.
- **Accessibility:** skip link, visible focus, keyboard-operable slider and accordion, labelled landmarks.

## Content sources

Text comes from your resume and LinkedIn. When they disagree, the resume wins (for example the JSA end date: resume says Aug 2026, LinkedIn says Sep 2026 / Present). Update `index.html` when either changes.

## Editing

- Add a project: copy one `<li class="q-item">…</li>` block in the Work section and change the text/ids.
- Add a job: copy one `<li class="xp-row">…</li>` in Experience. Add a certificate: copy one `<li>` in the `.certs` list.
- Change colours: edit the variables at the top of `style.css` (`--ink`, `--signal`, `--paper`, …).
- Change the playground data: `gen(...)` lines in `script.js`.

## Optional: remember the theme between visits

The toggle only lasts for the current visit. To persist it, add to `script.js`:

```js
// in the toggle click handler, after setAttribute:
try { localStorage.setItem('theme', root.getAttribute('data-theme')); } catch (e) {}
// and in the <head> script of index.html, before the matchMedia check:
// var t = localStorage.getItem('theme'); if (t) d.setAttribute('data-theme', t);
```

## Deploy

Push to the `main` branch of your `*.github.io` repository. GitHub Pages serves it as-is.
