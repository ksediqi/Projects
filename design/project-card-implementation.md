# Project Card Section — Implementation Reference

## What was built

A redesigned projects section with:
- Data-driven project cards rendered from a single source of truth (`config/data.js`)
- A floating background animation of tech icons and code symbols
- Correct stacking (animation behind cards, cards always on top)
- Light/dark mode support throughout

---

## 1. Data Layer — `config/data.js`

All 9 projects live in a single array. Each entry has:

```js
{
    id: 1,
    title: "Portfolio",
    subtitle: "Personal Project",
    description: "...",
    tags: ["HTML", "CSS", "JS"],
    url: "/projects/portfolio",
    github: "",
    type: "Frontend",    // used for the right-column label
    status: "live"       // "live" | "done" | "wip"
}
```

`routes/pages.js` loads this file and passes it to `main.ejs` as `projects`.

---

## 2. EJS Partial — `views/projects/project-card.ejs`

One template renders every card. The layout is a 3-column CSS Grid:

```
[01]  [TITLE · chip]          [Frontend   ]
      description              [● Live     ]
      [HTML][CSS][JS]          [View ↗     ]
```

```html
<article class="project-card">
    <span class="pc-num"><%= String(project.id).padStart(2, '0') %></span>

    <div class="pc-body">
        <div class="pc-top">
            <h2 class="pc-title"><%= project.title %></h2>
            <span class="pc-chip"><%= project.subtitle %></span>
        </div>
        <p class="pc-desc"><%= project.description %></p>
        <div class="pc-tags">
            <% project.tags.forEach(tag => { %>
                <span class="pc-tag"><%= tag %></span>
            <% }) %>
        </div>
    </div>

    <div class="pc-aside">
        <div class="pc-meta">
            <span class="pc-type"><%= project.type %></span>
            <span class="pc-status is-<%= project.status %>">
                <%= project.status === 'live' ? 'Live' : project.status === 'wip' ? 'In Progress' : 'Complete' %>
            </span>
        </div>
        <div class="pc-links">
            <a href="<%= project.url %>" class="pc-link-primary">View <span class="pc-arrow">↗</span></a>
            <% if (project.github) { %>
                <a href="<%= project.github %>" class="pc-link-secondary" target="_blank" rel="noopener">GitHub</a>
            <% } %>
        </div>
    </div>
</article>
```

---

## 3. Main Template — `views/main.ejs`

### Why duplicates happened (and the fix)

There were two card sources:
- 9 **hardcoded** `<article>` elements inside `.main-content` (inside `#hiddenContent`, login-gated)
- A `.projects-container` div **outside** `#hiddenContent` that also ran the EJS loop — always visible

Once `project-card.ejs` was activated, both rendered = 18 cards.

**Fix**: Replaced all 9 hardcoded cards with a single EJS loop. Deleted `.projects-container` entirely.

```html
<div class="main-content">
    <% projects.forEach(project => { %>
        <%- include('projects/project-card', { project }) %>
    <% }) %>
</div>
```

### Background animation placement

The `.pc-bg` div lives as the **first child of `<main id="hiddenContent">`**, not inside `.main-content`.

**Why this matters**: `.main-content` is max-width 960px and the cards cover ~95% of it with opaque white/dark backgrounds. Icons placed inside `.main-content` were hidden behind the cards. Placing `.pc-bg` inside `<main>` (which is full viewport width) gives clear visible space in the side margins (~240px each side on a 1440px screen).

```html
<main id="hiddenContent" class="main hidden">

    <div class="pc-bg" aria-hidden="true">
        <!-- Left margin column -->
        <i class="fa-brands fa-js"       style="--px:3%;  --py:8%;  --ps:4rem;  --pd:0s;   --pt:16s"></i>
        <i class="fa-brands fa-node-js"  style="--px:6%;  --py:26%; --ps:3.2rem;--pd:4s;   --pt:20s"></i>
        <span class="pc-bg-sym"          style="--px:2%;  --py:46%; --ps:2rem;  --pd:1.5s; --pt:18s">{}</span>
        <i class="fa-brands fa-python"   style="--px:5%;  --py:65%; --ps:3.5rem;--pd:6s;   --pt:14s"></i>
        <span class="pc-bg-sym"          style="--px:1%;  --py:84%; --ps:1.8rem;--pd:3s;   --pt:22s">=&gt;</span>
        <!-- Right margin column -->
        <i class="fa-brands fa-react"    style="--px:91%; --py:12%; --ps:4rem;  --pd:0.5s; --pt:18s"></i>
        <i class="fa-brands fa-html5"    style="--px:88%; --py:30%; --ps:3rem;  --pd:5s;   --pt:16s"></i>
        <span class="pc-bg-sym"          style="--px:94%; --py:50%; --ps:2rem;  --pd:2s;   --pt:20s">[ ]</span>
        <i class="fa-brands fa-git-alt"  style="--px:89%; --py:68%; --ps:3.5rem;--pd:7s;   --pt:15s"></i>
        <i class="fa-brands fa-css3-alt" style="--px:93%; --py:87%; --ps:2.5rem;--pd:1s;   --pt:19s"></i>
        <!-- Top area -->
        <i class="fa-brands fa-npm"      style="--px:25%; --py:2%;  --ps:3rem;  --pd:3.5s; --pt:17s"></i>
        <span class="pc-bg-sym"          style="--px:72%; --py:3%;  --ps:2.2rem;--pd:0s;   --pt:21s">&lt;/&gt;</span>
        <i class="fa-brands fa-github"   style="--px:48%; --py:1%;  --ps:2.5rem;--pd:2.5s; --pt:16s"></i>
        <!-- Bottom area -->
        <i class="fa-brands fa-react"    style="--px:33%; --py:93%; --ps:2.8rem;--pd:4.5s; --pt:18s"></i>
        <span class="pc-bg-sym"          style="--px:58%; --py:95%; --ps:1.8rem;--pd:1.5s; --pt:23s">const</span>
        <i class="fa-brands fa-js"       style="--px:18%; --py:95%; --ps:2rem;  --pd:6.5s; --pt:15s"></i>
    </div>

    <div class="main-title-container">
        ...
    </div>
    ...
    <div class="main-content">
        <% projects.forEach(...) %>
    </div>
</main>
```

#### CSS custom property shorthand per element

Each element uses 5 inline CSS variables:

| Variable | Controls        | Example   |
|----------|-----------------|-----------|
| `--px`   | `left` position | `3%`      |
| `--py`   | `top` position  | `8%`      |
| `--ps`   | `font-size`     | `4rem`    |
| `--pd`   | `animation-delay` | `0s`   |
| `--pt`   | `animation-duration` | `16s` |

Varying `--pd` (0s–7s) and `--pt` (13s–23s) per element means every icon is always at a different phase of its float cycle — nothing moves in sync.

---

## 4. CSS — `public/css/style.css`

### Card CSS class map

| Class | Element | Purpose |
|---|---|---|
| `.main-content` | `<div>` | Flex column container, max-width 960px |
| `.pc-bg` | `<div>` | Absolute overlay, full-section background |
| `.project-card` | `<article>` | 3-column grid shell |
| `.pc-num` | `<span>` | Large index number (01, 02…) |
| `.pc-body` | `<div>` | Middle column: title, desc, tags |
| `.pc-top` | `<div>` | Flex row: title + category chip |
| `.pc-title` | `<h2>` | Project name |
| `.pc-chip` | `<span>` | Category badge (bordered pill) |
| `.pc-desc` | `<p>` | Description text |
| `.pc-tags` | `<div>` | Tag row |
| `.pc-tag` | `<span>` | Individual tech tag (bordered pill) |
| `.pc-aside` | `<div>` | Right column: type, status, links |
| `.pc-meta` | `<div>` | Type label + status dot |
| `.pc-type` | `<span>` | "Frontend" / "Full-Stack" / "API" |
| `.pc-status` | `<span>` | Status with dot (`.is-live`, `.is-wip`, `.is-done`) |
| `.pc-links` | `<div>` | Button group |
| `.pc-link-primary` | `<a>` | "View ↗" filled button |
| `.pc-link-secondary` | `<a>` | "GitHub" ghost button |

### Card grid layout

```css
.project-card {
    display: grid;
    grid-template-columns: 3.5rem 1fr auto;
    /* [num 3.5rem fixed] [body flexible] [aside auto-width] */
}
```

### Status dot pattern

The colored dot before status text is a CSS `::before` pseudo-element:

```css
.pc-status::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor; /* inherits the status color */
}

.pc-status.is-live  { color: #22c55e; }
.pc-status.is-wip   { color: #f59e0b; }
.pc-status.is-done  { color: var(--text-light); }
```

### Per-card accent color + staggered entrance

Each card gets its own accent color and fade-in delay via `nth-child`:

```css
.project-card:nth-child(1) { --card-accent: var(--accent-1); animation-delay: 0.05s; }
.project-card:nth-child(2) { --card-accent: var(--accent-2); animation-delay: 0.10s; }
/* … up to :nth-child(9) */
```

### Hover left-border accent

The left border slides in on hover via `scaleY` transform (not `height`) for GPU-accelerated performance:

```css
.project-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--card-accent, var(--accent-1));
    transform: scaleY(0);
    transform-origin: center;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.project-card:hover::before { transform: scaleY(1); }
```

### Background animation CSS

```css
/* Positioned relative to <main class="main"> which already has:
   position: relative; overflow: hidden; min-height: 100vh */
.pc-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;           /* behind all content */
}

.pc-bg > * {
    position: absolute;
    left: var(--px, 50%);      /* from inline style */
    top: var(--py, 50%);
    font-size: var(--ps, 2rem);
    color: var(--text-color);
    opacity: 0.12;
    animation: pcBgFloat var(--pt, 16s) ease-in-out var(--pd, 0s) infinite;
    user-select: none;
    line-height: 1;
}

.pc-bg .pc-bg-sym {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 300;
}

@keyframes pcBgFloat {
    0%   { transform: translateY(0px)   rotate(0deg);  opacity: 0.12; }
    30%  { transform: translateY(-22px) rotate(5deg);  opacity: 0.18; }
    60%  { transform: translateY(-10px) rotate(-4deg); opacity: 0.08; }
    100% { transform: translateY(0px)   rotate(0deg);  opacity: 0.12; }
}

/* Cards sit above the background layer */
.project-card {
    position: relative;
    z-index: 1;
}
```

### Stacking order inside `<main>`

```
z-index: auto  →  .main::before  (subtle radial gradient overlay)
z-index: 0     →  .pc-bg         (floating icon animation)
z-index: 1     →  .project-card, .main-title-container, carousel
```

### Fonts required (Google Fonts)

Both `Staatliches` and `DM Mono` must be in the import or the design degrades:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500
  &family=DM+Sans:ital,opsz,wght@...
  &family=Instrument+Serif:ital@0;1
  &family=JetBrains+Mono:wght@300;400;500
  &family=Staatliches
  &display=swap" rel="stylesheet" />
```

| Font | Used for |
|---|---|
| `Staatliches` | `.pc-num`, `.pc-title`, all `h1-h6` globally |
| `DM Mono` | `.pc-chip`, `.pc-tag`, `.pc-type`, `.pc-status` |
| `JetBrains Mono` | `.pc-bg-sym` (code symbols in background) |
| `DM Sans` | Body text, navigation |

---

## 5. Responsive behaviour (`@media (max-width: 900px)`)

At tablet/mobile the 3-column grid collapses to 2 columns, and `.pc-aside` spans full width below:

```css
.project-card {
    grid-template-columns: 2.5rem 1fr;
}
.pc-aside {
    grid-column: 1 / -1;         /* spans both columns */
    flex-direction: row;
    justify-content: space-between;
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
}
```