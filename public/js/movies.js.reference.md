# `movies.js` — Reference Guide

This document walks through `movies.js` section by section: what each part is
responsible for, the key functions/variables in it, how it connects to the
rest of the file, and anything worth knowing if you're about to change it.

---

## 00. Config & Constants

**What's here:** `CONFIG`, the `GENRES` lookup, and three small pure
functions: `getGenreName()`, `isKidsMovie()`, `formatMatchScore()`.

```js
const CONFIG = {
    API_BASE: "/api/list",
    IMG_BASE: "https://image.tmdb.org/t/p/w500",
    BACKDROP_BASE: "https://image.tmdb.org/t/p/original",
    DATE_FORMATS: { ... },
    RELEASE_DATE_FILTERS: { ... },
};

const GENRES = {
    16: {name: "Animation", isKids: true},
    ...
};
```

**Why it's structured this way:** `GENRES` used to exist twice — once as a
name→id map inside `CONFIG`, and again as a separate id→name map further
down the file. Two copies of the same data meant every genre addition or
rename had to be made in both places, and it was easy for them to drift out
of sync. Now there's one object, keyed by TMDB genre id, and every other
part of the file reads from it:

- `getGenreName(id)` — used by the modal to turn `item.genreIds` into a
  readable string ("Action, Comedy").
- `isKidsMovie(item)` — checks whether *any* of an item's genre ids has
  `isKids: true`. Used by the genre filter, the "Kids & Family" row, and the
  nav's Kids view.
- `formatMatchScore(rating)` — converts a 0–10 rating into a "NN% Match"
  string (or `"New"` if there's no rating yet). Used by the hero banner.

**Not currently used elsewhere in this file:** `CONFIG.DATE_FORMATS` and
`CONFIG.RELEASE_DATE_FILTERS`. They're not dead code by definition — another
file could reference `CONFIG` — but nothing in `movies.js` itself reads
them. Worth checking before deleting.

**If you add a genre:** add one entry to `GENRES`, nowhere else.

---

## 01. State

**What's here:** a single `state` object holding everything that changes
while the page is open.

```js
const state = {
    favorites: [],
    allLoadedMovies: [],
    currentModalItem: null,
    currentHeroItem: null,
    videoPlayer: null,
};
```

| Field | Set by | Read by |
|---|---|---|
| `favorites` | `loadFavoritesState()`, `toggleFavorite()` | `renderMyList()`, `isFavorite()`, `switchView("mylist")` |
| `allLoadedMovies` | `loadDashboardData()` | search, genre filter, `switchView()` |
| `currentModalItem` | `openModal()` | the modal's own play/favorite buttons |
| `currentHeroItem` | `updateHero()` | hero's play/info buttons |
| `videoPlayer` | `initApp()` (once) | every play button, hero, modal |

**Why one object instead of separate variables:** everything in it is
mutable UI state that multiple, unrelated functions need to read. Keeping it
in one place makes it possible to see the entire "what does the page
currently know" surface at a glance, and makes it obvious in any function
body when it's touching shared state (`state.X`) versus a local variable.

---

## 02. DOM References

**What's here:** five `getElementById` calls, resolved once at module load
and reused everywhere.

```js
const mainContent = document.getElementById("mainContent");
const searchResults = document.getElementById("searchResults");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("movieModal");
const closeModalBtn = document.getElementById("closeModal");
```

**Why these five specifically:** these are the elements referenced from
*more than one* function (e.g. `mainContent` is toggled by `switchView()`,
`setupSearch()`, and `handleGenreClick()`). Elements only used inside a
single function — like `heroTitle` inside `updateHero()` — are still queried
locally inside that function, since pulling every single id up here would
bury the five that actually matter.

**Why this is safe at module load time (no `DOMContentLoaded` needed):**
the script tag is expected to load after the HTML it references already
exists in the page (e.g. placed at the end of `<body>`). If that ever
changes — the script moves into `<head>` without `defer`, for instance —
these five lines would all resolve to `null` and everything downstream would
silently stop working. See section 12 for how `initApp()` itself protects
against the equivalent timing problem.

---

## 03. Favorites (localStorage)

**What's here:** the entire "My List" persistence layer.

- `loadFavoritesState()` — reads `movieFlixFavorites` from `localStorage`
  into `state.favorites`. Wrapped in try/catch so a corrupted or missing
  value degrades to an empty list instead of throwing.
- `saveFavorites()` — writes `state.favorites` back out.
- `isFavorite(id)` — `true`/`false` lookup, used by card rendering and the
  modal to decide which glyph (`+` vs `✓`) to show.
- `toggleFavorite(item)` — adds or removes `item`, saves, and then
  re-renders every place a favorite state is visible:
  `renderMyList()` (the My List row), `updateFavoriteButtons()` (every
  card's `+`/`✓` button on the page), and `updateModalButton()` (the modal's
  own button, if open).
- `updateFavoriteButtons()` — loops every `.favorite-btn` currently in the
  DOM and syncs its icon/title. This matters because the same title can
  appear in more than one row (e.g. Trending *and* Popular) — toggling one
  instance needs to update all of them, not just the card that was clicked.
- `updateModalButton(id)` — same idea, but for the modal's single button.

**Data shape stored:** `state.favorites` holds full item objects (not just
ids), so re-rendering "My List" never needs another network call.

**Ids are always compared with `Number(...)`.** Card `dataset.id` values
come through as strings (all DOM attributes are strings); item ids from the
API are numbers. `isFavorite`, `toggleFavorite`, and `updateFavoriteButtons`
all normalize with `Number()` before comparing — if that's ever dropped,
`"123" === 123` will silently fail and favoriting will stop working for
every item, with no error thrown.

---

## 04. Render Helpers (cards, grids, empty state)

**What's here:** everything that turns movie data into DOM nodes.

- **`showEmptyState(gridId, message)`** — clears a grid and drops in a
  plain "no results" message. Always uses `textContent`, never `innerHTML`,
  specifically because `message` can come from unfiltered user input (the
  search box). `textContent` guarantees that input is rendered as visible
  text, never parsed as HTML/JS — this is what closes off a stored/reflected
  XSS path a raw `innerHTML = ...concatenation...` would otherwise open.

- **`cardTemplate(item, isKidsContent)`** — builds one `.movie-card`. This
  is the function every row (`Trending`, `Popular`, `My List`, search
  results, genre filter results...) ultimately calls. Structure:

  ```html
  <div class="movie-card" data-id="…" data-genre="…">
    [optional KIDS badge]
    <img class="movie-poster">
    <div class="card-actions-overlay">
      <button class="btn-icon play-btn">…</button>
      <button class="btn-icon favorite-btn">+ / ✓</button>
    </div>
    <div class="movie-info-overlay">
      <div class="movie-title">…</div>
      <div class="movie-meta"><span>year</span><span>⭐ rating</span></div>
    </div>
  </div>
  ```

  Three click handlers get attached: the card itself opens the modal
  (unless the click landed on a `.btn-icon`, checked via
  `e.target.closest(".btn-icon")`), the play button calls
  `state.videoPlayer.playVideo(item)`, and the favorite button calls
  `toggleFavorite(item)`. Both icon buttons call `e.stopPropagation()` so
  clicking them doesn't *also* fire the card's own "open modal" handler.

  **Known gap:** `card.setAttribute("data-genre", item.genre || "Unknown")`
  always writes `"Unknown"` — items from `fetchMovies()` (section 11) carry
  a `genreIds` array, never a singular `.genre` field, so this attribute is
  currently dead weight. Not fixed here since it doesn't affect behavior
  anywhere else in the file, but worth knowing if you ever go looking for
  `data-genre` and wonder why it's always the same value.

- **`renderGrid(gridId, items, isKidsGrid)`** — clears a row and appends one
  card per item. Every row on the page (`trendingGrid`, `popularGrid`,
  `myListGrid`, `searchGrid`, etc.) is populated through this one function.

- **`renderMyList()`** — shows/hides the entire "My List" section based on
  whether `state.favorites` is empty, and calls `renderGrid()` for the
  contents when it's not.

---

## 05. Hero Banner

**What's here:** `updateHero(movie)` and `hideHeroSection()`.

`updateHero()` pushes one movie's data into the six hero elements
(`heroTitle`, `heroDesc`, `heroYear`, `heroMatch`, `heroBadge`, `heroBg`) and
records it as `state.currentHeroItem`, which is what the hero's Play and
More Info buttons act on later (section 10). Every field is guarded with
`if (el) ...` since the hero only exists on the home view — this function
is safe to call even if some of those elements aren't in the DOM.

`hideHeroSection()` just hides `#movie_home`. It's called from several
places — search, genre filtering, switching to any non-home view — anywhere
the hero banner would otherwise sit behind content that's replaced it.

---

## 06. Row Slider Scrolling

**What's here:** one function, `scrollRow(gridId, direction)`.

Scrolls a `.row-slider` by 80% of the current viewport width in the given
direction, using native smooth scrolling. The left/right arrow buttons on
each row call this — the actual click listeners that connect the arrow
buttons to this function live in `setupGlobalListeners()` (section 12),
since that's where all the rows get looped over once at startup.

---

## 07. Views & Navigation (nav links, search)

**What's here:** the logic for switching between the home view, a filtered
view (Movies / TV Shows / New & Popular / Kids / My List), and live search.

- **`switchView(viewId)`** — the central view router. `"movie_home"` shows
  the normal dashboard (all rows + hero) and resets the genre dropdown's
  selection back to "All Genres". Anything else hides `mainContent`, shows
  `searchResults`, filters `state.allLoadedMovies` by the relevant
  criterion, and renders the result into `#searchGrid`. If the filtered
  list comes back empty, `showEmptyState()` fills in a message instead of
  leaving a blank grid.

  Guard clause worth knowing about: `if (!searchResults) return;` — this
  file is loaded site-wide, so if a page other than the movie dashboard also
  has `.nav-links a` elements (which trigger the same click listener below),
  this stops the function from crashing on a page that has no
  `#searchResults` element to work with.

- **`setupNavLinks()`** — attaches the click listener to every `.nav-links
  a`. Intercepts the click (`preventDefault`), moves the `.active` class to
  the clicked link, and calls `switchView()` with the `#hash` from the
  link's `href`.

- **`setupSearch()`** — attaches an `input` listener to the search box.
  Non-empty query → filters `state.allLoadedMovies` by title/genre and
  renders into `#searchGrid` (with the same XSS-safe empty-state handling
  described in section 04). Empty query → calls `switchView("movie_home")`
  to restore the normal dashboard.

---

## 08. Genre Filter Dropdown

**What's here:** `setupGenreFilter()` and `handleGenreClick()`.

`setupGenreFilter()` wires up three things: clicking the "Genres" button
toggles the `.show` class on `.dropdown-content`; clicking *anywhere else*
on the page closes it (via a document-level click listener that checks
`e.target.closest(".genre-dropdown-wrapper")`); and clicking any
`.genre-item` calls `handleGenreClick()`.

`handleGenreClick(item, dropdownMenu)` marks the clicked genre as
`.selected`, then either restores the home view (if "All Genres" was
picked) or filters `state.allLoadedMovies` by that genre id and renders the
results — following the same show-results-or-show-empty-state pattern as
search. The hero is hidden unconditionally on the filtered path (not just
when results are found), so an empty genre result can't leave the hero
banner visibly stuck behind the empty-state message.

---

## 09. Detail Modal

**What's here:** `openModal(item)`, `closeModal()`, `setupModal()`.

`openModal()` populates every field in the modal (title, image, year,
rating, description, genre list via `getGenreName`, mature flag), sets
`state.currentModalItem`, wires the modal's own list button to
`toggleFavorite(item)`, and adds the `.open` class that makes the modal
visible (styling lives in the CSS, not here).

`closeModal()` is a small factored-out helper: remove `.open`, restore
`document.body`'s scroll. Three separate places need exactly this pair of
actions — the close (×) button, clicking the dimmed backdrop, and pressing
Escape (handled in section 10) — so they all call this one function instead
of repeating the same two lines three times.

`setupModal()` wires the close button and the backdrop click. Backdrop
detection is `e.target === modal` — this only matches when the click landed
directly on the overlay `div` itself, not on anything inside the modal
panel, which is why clicking inside the modal content doesn't accidentally
close it.

---

## 10. Video Player

**What's here:** `setupVideoPlayer()`, called exactly once, from
`initApp()`.

This function wires up the modal's Play button, the hero's Play and More
Info buttons, the video overlay's close button, and a document-level
Escape-key handler — then returns `{ playVideo }`, which gets stored as
`state.videoPlayer`.

**Why this only runs once:** every one of those five listeners
(`modalPlayBtn` click, `heroPlayBtn` click, `heroInfoBtn` click,
`closeVideoBtn` click, and the `keydown` listener) gets permanently attached
to its element or to `document` every time this function runs. If
individual movie cards called `setupVideoPlayer()` themselves — instead of
using the shared instance — every card click would attach five *more*
copies of these listeners on top of the ones already there. After enough
clicks, a single Escape press would fire the same close logic a dozen times
over. Storing one instance on `state.videoPlayer` and having cards call
`state.videoPlayer.playVideo(item)` (section 04) avoids that entirely.

`playVideo(item)` builds a `vidsrc.to` embed URL from the item's type and
id, points the iframe at it, and shows the overlay. `closeVideo()` reverses
all of that, including clearing the iframe's `src` — this stops the video
from continuing to play in the background after the overlay is hidden.

---

## 11. Data Loading (API)

**What's here:** `fetchMovies()`, `processKidsContent()`,
`loadDashboardData()`.

- **`fetchMovies(type, sort)`** — calls `${CONFIG.API_BASE}?type=...&sort=...`,
  and normalizes whatever comes back into one consistent shape (`id`,
  `title`, `isAdult`, `genreIds`, `poster`, `backdrop`, `rating`, `year`,
  `release_date`, `overview`, `type`) regardless of whether the raw response
  used TMDB-style field names (`poster_path`, `vote_average`, `genre_ids`,
  `first_air_date`) or already-normalized ones. Every failure mode — bad
  HTTP status, malformed/non-array JSON, a thrown network error — returns an
  empty array rather than letting the error propagate, so one failed
  category can't take down the whole dashboard.

- **`processKidsContent(allContent)`** — filters for kids content (via
  `isKidsMovie` from section 00), renders it into `#kidGrid`, and
  shows/hides the entire Kids & Family row based on whether anything
  qualified.

- **`loadDashboardData()`** — the orchestrator. Fires all four category
  fetches in parallel with `Promise.allSettled` (one category failing
  doesn't block the others from rendering), renders each into its row,
  hides any row that came back empty, picks a random trending item for the
  hero, and finally de-duplicates everything into `state.allLoadedMovies` —
  using a `Map` keyed by `id`, since the same title can legitimately appear
  in more than one category (e.g. both Trending and Popular) and shouldn't
  be counted twice by search or the genre filter.

---

## 12. Initialization

**What's here:** `setupGlobalListeners()`, `initApp()`, and the bootstrap
check at the very bottom of the file.

`setupGlobalListeners()` handles two things that don't fit neatly into any
other section: the scroll listener that toggles `.scrolled` on the header
(for the CSS to solidify the nav background), and wiring every row's
left/right arrow buttons to `scrollRow()` (section 06).

`initApp()` is the full startup sequence, in order:

```js
async function initApp() {
    loadFavoritesState();      // 03 — read localStorage before anything renders
    setupGlobalListeners();    // 12 — scroll + slider arrows
    setupNavLinks();           // 07
    setupSearch();             // 07
    setupModal();              // 09
    renderMyList();            // 03/04 — show My List if there are any favorites yet
    await loadDashboardData(); // 11 — fetch + render all rows, wait for it
    setupGenreFilter();        // 08 — after allLoadedMovies exists, so filtering works immediately
    state.videoPlayer = setupVideoPlayer(); // 10 — built once
}
```

The order matters in two places: `loadFavoritesState()` has to run before
`renderMyList()` (nothing to show otherwise), and `setupGenreFilter()` is
placed after `loadDashboardData()` finishes so that the moment someone can
click a genre, `state.allLoadedMovies` is already populated.

The bootstrap at the bottom:

```js
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
```

This handles both possible timings. If the script runs *before* the page
has finished parsing (`readyState === "loading"`), it waits for
`DOMContentLoaded`. If the script runs *after* that point already happened
— which is the normal case for a `<script>` tag placed at the end of
`<body>`, since by then the browser has already parsed everything above it
— registering a `DOMContentLoaded` listener at that point would never fire,
because the event already happened. Checking `readyState` first and calling
`initApp()` directly in that case covers both.
