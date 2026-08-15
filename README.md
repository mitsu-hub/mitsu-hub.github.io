# Mitsu.github.io
## Personal Web Portfolio & GitHub Pages Deployment

This project is a personal web portfolio designed and deployed using GitHub
Pages to professionally showcase projects, technical skills, and resume
content. The site functions as a central hub for personal branding and is
built with scalability and maintainability in mind.

---

## Project Overview

The goal of this project was to create a clean, professional, and easily
maintainable personal website that consolidates key information such as
projects, technical skills, and resume materials into a single public-facing
platform.

Rather than a single-page site, the portfolio is structured as a multi-page
static website to support future growth and clear content separation.

---

## Site Structure

```
mitsu-hub.github.io/
├── index.html            # Landing page (About, Projects, Skills, Contact)
├── style.css             # Shared design system + shared components (nav, footer, dark mode)
├── script.js             # Shared behavior (mobile nav, dark mode, scroll-reveal, footer year)
├── resume.pdf             # Downloadable resume
└── portfolio/
    └── index.html         # Detailed projects and technical portfolio
```

### Structure Design Rationale

- **Separation of concerns**
  The landing page (`index.html`) provides a concise overview, while detailed
  project descriptions are placed in the `/portfolio` directory.
- **Scalability**
  Additional sections such as `/blog`, `/labs`, or `/projects` can be added
  without restructuring the existing site.
- **Consistency**
  A single shared CSS file and a single shared JS file ensure a unified
  visual style and behavior across all pages.
- **Maintainability**
  Static files and GitHub Pages hosting minimize complexity while enabling
  easy updates and version control through Git.

---

## Technologies Used

- HTML5
- CSS3 (custom properties / design tokens, no framework)
- Vanilla JavaScript (no build step, no dependencies)
- Git & GitHub
- GitHub Pages

---

## Recent Improvements

A pass was made across the whole site to fix consistency issues and round
out the design with a few standard modern-site features:

- **Consistent, root-relative links.** Every internal link (`/`,
  `/portfolio/`, `/style.css`, `/script.js`, `/Mitsutaka_Uehara_resume.pdf`)
  now uses the same absolute-path convention everywhere, so pages can be
  added at any depth without ever recalculating `../` chains.
- **Dark mode.** The site now follows the visitor's OS-level light/dark
  preference automatically, with a manual toggle in the header for anyone
  who wants to override it for the current visit. All existing components
  already used CSS custom properties for color, so the dark palette applies
  everywhere for free.
- **Mobile navigation.** Below 640px, the nav collapses behind a hamburger
  button instead of just shrinking; it closes on link click, on `Esc`, and
  when the window is resized back to desktop width.
- **Accessibility.** Added a skip-to-content link, visible keyboard focus
  states, `aria-current="page"` on the active nav link, `aria-expanded` /
  `aria-pressed` on the two header buttons, and `prefers-reduced-motion`
  support for every animation on the site.
- **SEO / sharing.** Added per-page `<meta description>` and Open Graph
  tags, plus a small inline SVG favicon (no extra image asset needed).
- **Small polish.** Restrained entrance animation on the hero, a one-time
  scroll-reveal on each section, and a footer year that updates itself via
  `script.js` instead of being hardcoded.

### A note on the dark-mode toggle

The toggle keeps its state in memory for the current visit rather than in
`localStorage`, so it won't remember your choice after a full reload. That
was a deliberate, minimal choice — if you'd like it to persist across
visits on the live site, it's a small addition:

```js
// inside the theme-toggle click handler in script.js
localStorage.setItem('theme', next);
// …and on load: root.setAttribute('data-theme', localStorage.getItem('theme') || '')
```

---

## Design Considerations

- Prioritized clarity and readability over heavy frameworks
- Chose a static site approach to reduce dependencies and security risks
- Designed navigation and layout with both recruiters and technical
  reviewers in mind

---

## Future Improvements

- Add live project links and GitHub repositories to each project card
- Optional migration to a custom domain
- Expand portfolio with additional technical labs and documentation
- Persist the dark-mode choice across visits (see note above)

---

## Design Decisions

### Why a Static Site (GitHub Pages)

Chose a static site approach using GitHub Pages to minimize complexity,
reduce security risks, and focus on clean structure and content clarity.
This approach eliminates the need for server-side management while
providing reliable and fast public access.

### Why a Multi-Page Structure

Instead of placing all content on a single page, the site is structured
into separate pages to improve readability and support future expansion.
This design allows new sections (e.g., additional projects or labs) to be
added without disrupting the existing layout.

### Centralized Styling & Behavior

A single shared CSS file and a single shared JS file are used across all
pages to ensure consistent visual design and behavior and simplify
maintenance. Global styles and scripts reduce duplication and make future
updates more efficient.

### Git-Based Workflow

All changes are managed through Git, allowing version control, rollback,
and incremental improvements. This workflow reflects real-world
development practices and supports ongoing iteration.

---

## Author

Mitsu
