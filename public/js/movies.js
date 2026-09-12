/* =============================================================================
   MOVIES.JS — streaming dashboard: hero, row sliders, search, genre filter,
   favorites ("My List"), detail modal, video player.

   Sections:
     00. Config & constants
     01. State
     02. DOM references
     03. Favorites (localStorage)
     04. Render helpers (cards, grids, empty state)
     05. Hero banner
     06. Row slider scrolling
     07. Views & navigation (nav links, search)
     08. Genre filter dropdown
     09. Detail modal
     10. Video player
     11. Data loading (API)
     12. Initialization
   ============================================================================= */


/* =============================================================================
   00. CONFIG & CONSTANTS
   ============================================================================= */

const CONFIG = {
    API_BASE: "/api/list",
    IMG_BASE: "https://image.tmdb.org/t/p/w500",
    BACKDROP_BASE: "https://image.tmdb.org/t/p/original",
    DATE_FORMATS: {
        DISPLAY: "MMM DD, YYYY",
        API: "YYYY-MM-DD",
        SHORT: "MMM YYYY",
    },
    RELEASE_DATE_FILTERS: {
        UPCOMING: "upcoming",
        Now_playing: "now_playing",
        PAST_YEAR: "past_year",
    },
};

// Single source of truth for genre id -> display name + kids flag.
// (Previously duplicated as a separate name->id map in CONFIG; that copy is
// gone, so there's only one place to edit when genres change.)
const GENRES = {
    16: {name: "Animation", isKids: true},
    10751: {name: "Family", isKids: true},
    10762: {name: "Kids", isKids: true},
    28: {name: "Action"},
    35: {name: "Comedy"},
    18: {name: "Drama"},
    10770: {name: "TV Movie"},
    878: {name: "Sci-Fi"},
    53: {name: "Thriller"},
    10749: {name: "Romance"},
};

function getGenreName(id) {
    return GENRES[id] ? GENRES[id].name : "Unknown";
}

function isKidsMovie(item) {
    return item.genreIds && item.genreIds.some((id) => GENRES[id]?.isKids === true);
}

function formatMatchScore(rating) {
    if (!rating && rating !== 0) return "New";
    return `${Math.min(100, Math.max(0, Math.round((rating / 10) * 100)))}% Match`;
}


/* =============================================================================
   01. STATE
   ============================================================================= */

const state = {
    favorites: [],          // "My List" items, persisted to localStorage
    allLoadedMovies: [],     // flat de-duped pool used by search/genre filter
    currentModalItem: null,  // item shown in the detail modal
    currentHeroItem: null,   // item shown in the hero banner
    videoPlayer: null,       // set once by setupVideoPlayer() in initApp()
};


/* =============================================================================
   02. DOM REFERENCES
   Queried once, reused everywhere. All of these elements are static markup
   (present in the page HTML at parse time), so it's safe to resolve them at
   module load — no DOMContentLoaded needed for the lookups themselves.
   ============================================================================= */

const mainContent = document.getElementById("mainContent");
const searchResults = document.getElementById("searchResults");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("movieModal");
const closeModalBtn = document.getElementById("closeModal");


/* =============================================================================
   03. FAVORITES ("My List") — localStorage-backed
   ============================================================================= */

function loadFavoritesState() {
    try {
        state.favorites = JSON.parse(
            localStorage.getItem("movieFlixFavorites") || "[]",
        );
    } catch (e) {
        state.favorites = [];
    }
}

function saveFavorites() {
    localStorage.setItem("movieFlixFavorites", JSON.stringify(state.favorites));
}

function isFavorite(id) {
    return state.favorites.some((x) => Number(x.id) === Number(id));
}

function toggleFavorite(item) {
    const idx = state.favorites.findIndex((x) => Number(x.id) === Number(item.id));
    if (idx === -1) {
        state.favorites.push(item);
    } else {
        state.favorites.splice(idx, 1);
    }
    saveFavorites();
    renderMyList();
    updateFavoriteButtons();
    updateModalButton(item.id);
}

// Sync every card's favorite-button glyph/title with current state. Called
// after any toggle so all instances of a card (e.g. same title appearing in
// two rows) stay in sync, not just the one that was clicked.
function updateFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
        const id = Number(btn.dataset.id);
        const fav = isFavorite(id);
        btn.innerHTML = fav ? "x" : "+";
        btn.title = fav ? "Remove from list" : "Add to list";
    });
}

function updateModalButton(id) {
    const btn = document.getElementById("modalListBtn");
    if (!btn) return;
    btn.textContent = isFavorite(id) ? "✓ On My List" : "+ My List";
}


/* =============================================================================
   04. RENDER HELPERS — cards, grids, empty state
   ============================================================================= */

// Centralised "no results" renderer. Always uses textContent (never
// innerHTML) so a value that flows in from user input — e.g. a search query —
// can never be interpreted as markup.
function showEmptyState(gridId, message) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = "";
    const msg = document.createElement("div");
    msg.style.cssText = "color:white; padding:20px; font-size:1.2rem;";
    msg.textContent = message;
    grid.appendChild(msg);
}

function cardTemplate(item, isKidsContent = false) {
    const posterUrl =
        item.poster || `https://placehold.co/300x450?text=${encodeURIComponent(item.title)}`;

    const card = document.createElement("div");
    card.className = "movie-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-genre", item.genre || "Unknown");

    const kidsBadge = isKidsContent
        ? '<div style="position:absolute; top:8px; left:8px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; z-index:5;">KIDS</div>'
        : "";

    card.innerHTML = `
        ${kidsBadge}
        <img class="movie-poster" src="${posterUrl}" data-src="${posterUrl}" alt="${item.title}" loading="lazy">
        <div class="card-actions-overlay">
            <button class="btn-icon play-btn" data-id="${item.id}">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            </button>
            <button class="btn-icon favorite-btn" data-id="${item.id}">
                ${isFavorite(item.id) ? "✓" : "+"}
            </button>
        </div>
        <div class="movie-info-overlay">
            <div class="movie-title">${item.title}</div>
            <div class="movie-meta">
                <span>${item.release_date || item.year || "N/A"}</span>
                <span>⭐ ${item.rating ? item.rating.toFixed(1) : "N/A"}</span>
            </div>
        </div>
    `;

    // Clicking the card body opens the detail modal; clicking either icon
    // button (play / favorite) is handled separately below and must not
    // also trigger the card's own click handler.
    card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-icon")) return;
        openModal(item);
    });

    card.querySelector(".play-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        // Uses the single videoPlayer instance created once in initApp(),
        // rather than constructing a new one per click (see section 10).
        if (state.videoPlayer) state.videoPlayer.playVideo(item);
    });

    card.querySelector(".favorite-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(item);
    });

    return card;
}

function renderGrid(gridId, items, isKidsGrid = false) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = "";
    if (!items || items.length === 0) return;
    items.forEach((it) => {
        if (it) grid.appendChild(cardTemplate(it, isKidsGrid));
    });
}

function renderMyList() {
    const section = document.getElementById("mylist");
    if (!section) return;

    if (!state.favorites.length) {
        section.style.display = "none";
    } else {
        section.style.display = "block";
        renderGrid("myListGrid", state.favorites);
    }
}


/* =============================================================================
   05. HERO BANNER
   ============================================================================= */

function updateHero(movie) {
    if (!movie) return;
    state.currentHeroItem = movie;

    const heroTitle = document.getElementById("heroTitle");
    const heroDesc = document.getElementById("heroDesc");
    const heroYear = document.getElementById("heroYear");
    const heroMatch = document.getElementById("heroMatch");
    const heroBadge = document.getElementById("heroBadge");
    const heroBg = document.getElementById("heroBg");

    if (heroTitle) heroTitle.textContent = movie.title;
    if (heroDesc) heroDesc.textContent = movie.overview || "A top pick for your watchlist.";
    if (heroYear) {
        heroYear.textContent = movie.release_date
            ? movie.release_date.slice(0, 4)
            : movie.year || "";
    }
    if (heroMatch) heroMatch.textContent = formatMatchScore(movie.rating);
    if (heroBadge) heroBadge.textContent = movie.rating >= 8 ? "TOP 10" : "Popular";
    if (heroBg) {
        const bgUrl = movie.backdrop || movie.poster;
        if (bgUrl) heroBg.style.backgroundImage = `url('${bgUrl}')`;
    }
}

function hideHeroSection() {

    const herosection = document.getElementById("movie_home");
    if (herosection) herosection.style.display = "none";
}


/* =============================================================================
   06. ROW SLIDER SCROLLING
   ============================================================================= */

function scrollRow(gridId, direction) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const scrollAmount = window.innerWidth * 0.8;
    grid.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
    });
}


/* =============================================================================
   07. VIEWS & NAVIGATION — nav links + search box
   ============================================================================= */

function switchView(viewId) {
    if (searchInput) searchInput.value = "";

    if (viewId === "movie_home") {
        if (mainContent) mainContent.style.display = "block";
        if (searchResults) searchResults.style.display = "none";

        const banner = document.querySelector(".hero-banner");
        if (banner) banner.style.display = "block";

        document.querySelectorAll(".row-section").forEach((row) => {
            row.style.display = "block";
        });

        document.querySelectorAll(".genre-item").forEach((i) => i.classList.remove("selected"));
        document.querySelector('.genre-item[data-genre="all"]')?.classList.add("selected");
        return;
    }

    // movies.js loads site-wide, but mainContent/searchResults only exist on
    // the movie page. Other pages share the ".nav-links a" listener below —
    // bail out instead of crashing when those elements aren't present.
    if (!searchResults) return;

    if (mainContent) mainContent.style.display = "none";
    searchResults.style.display = "block";

    const titleEl = searchResults.querySelector("h2");
    let results = [];

    if (viewId === "movies") {
        if (titleEl) titleEl.textContent = "Movies";
        results = state.allLoadedMovies.filter((m) => m.type === "movie");
    } else if (viewId === "new") {
        if (titleEl) titleEl.textContent = "New & Popular";
        const currentYear = new Date().getFullYear();
        results = state.allLoadedMovies.filter((m) => parseInt(m.year || "0", 10) >= currentYear - 1);
    } else if (viewId === "tvshow") {
        if (titleEl) titleEl.textContent = "TV Shows";
        results = state.allLoadedMovies.filter((m) => m.type === "tv");
    } else if (viewId === "kid") {
        if (titleEl) titleEl.textContent = "Kids & Family";
        results = state.allLoadedMovies.filter(isKidsMovie);
    } else if (viewId === "mylist") {
        if (titleEl) titleEl.textContent = "My List";
        results = state.favorites;
    }

    renderGrid("searchGrid", results);
    if (results.length === 0) {
        showEmptyState("searchGrid", "No Watch List Items Added.");
    }
    hideHeroSection();
}

function setupNavLinks() {
    document.querySelectorAll(".nav-links a").forEach((link) => {

        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            e.preventDefault();
            document.querySelectorAll(".nav-links a").forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
            switchView(href.substring(1));
        });
    });
}

function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {

        const query = e.target.value.toLowerCase().trim();

        if (query.length > 0) {
            if (mainContent) mainContent.style.display = "none";
            if (searchResults) searchResults.style.display = "block";

            const titleEl = searchResults.querySelector("h2");
            if (titleEl) titleEl.textContent = "Search Results";

            const results = state.allLoadedMovies.filter(
                (movie) =>
                    movie.title.toLowerCase().includes(query) ||
                    (movie.genre && movie.genre.toLowerCase().includes(query)),
            );
            renderGrid("searchGrid", results);

            if (results.length === 0) {
                // textContent under the hood (via showEmptyState), so a query
                // like <img src=x onerror=alert(1)> is rendered as plain text,
                // not parsed as markup.
                showEmptyState("searchGrid", `No results found for "${query}"`);
            }
        } else {
            switchView("movie_home");
        }
        hideHeroSection();
    });
}


/* =============================================================================
   08. GENRE FILTER DROPDOWN
   ============================================================================= */

function setupGenreFilter() {
    const dropdownButton = document.getElementById("genreDropdownBtn");
    const dropdownMenu = document.querySelector(".dropdown-content");
    const genreItems = document.querySelectorAll(".genre-item");


    if (dropdownButton && dropdownMenu) {

        dropdownButton.addEventListener("click", (e) => {

            e.stopPropagation();
            dropdownMenu.classList.toggle("show");

        });

        document.addEventListener("click", (e) => {

            if (!e.target.closest(".dropdown-section")) {
                dropdownMenu.classList.remove("show");

            }


        });

    }

    genreItems.forEach((item) => {
        item.addEventListener("click", (e) => handleGenreClick(item, dropdownMenu));

    });

}


// DropDown Menu ends here

function handleGenreClick(item, dropdownMenu) {
    const genreId = item.dataset.genre;

    document.querySelectorAll(".genre-item").forEach((i) => i.classList.remove("selected"));
    item.classList.add("selected");

    if (genreId === "all") {
        switchView("movie_home");
    } else {
        if (mainContent) mainContent.style.display = "none";
        if (searchResults) searchResults.style.display = "block";

        const titleEl = searchResults.querySelector("h2");
        if (titleEl) titleEl.textContent = `${item.textContent} Movies`;

        const filtered = state.allLoadedMovies.filter(
            (m) => m.genreIds && m.genreIds.includes(Number(genreId)),
        );
        renderGrid("searchGrid", filtered);

        // Hide the hero unconditionally (not just on the "results found"
        // path) so an empty result set can't leave the hero banner showing
        // behind the empty-state message.
        hideHeroSection();

        if (filtered.length === 0) {
            showEmptyState("searchGrid", "No movies found in this genre.");
        }
    }

    if (dropdownMenu) dropdownMenu.classList.remove("show");
}


/* =============================================================================
   09. DETAIL MODAL
   ============================================================================= */

function openModal(item) {
    if (!item) return;
    state.currentModalItem = item;

    const mTitle = document.getElementById("modalTitle");
    const mImg = document.getElementById("modalImg");
    const mYear = document.getElementById("modalYear");
    const mRating = document.getElementById("modalRating");
    const mDesc = document.getElementById("modalDesc");
    const mGenres = document.getElementById("modalGenres");
    const mAdult = document.getElementById("modalAdult");

    if (mTitle) mTitle.textContent = item.title;
    if (mImg) mImg.src = item.poster || item.backdrop || "";
    if (mYear) {
        mYear.textContent = item.release_date ? item.release_date.slice(0, 4) : item.year || "";
    }
    if (mRating) mRating.textContent = item.rating ? item.rating.toFixed(1) : "N/A";
    if (mDesc) {
        mDesc.textContent =
            item.overview ||
            `Experience the thrill of ${item.title}. A cinematic masterpiece that has captured audiences worldwide.`;
    }
    if (mGenres) {
        mGenres.textContent =
            item.genreIds && item.genreIds.length ? item.genreIds.map(getGenreName).join(", ") : "Unknown";
    }
    if (mAdult) mAdult.textContent = item.isAdult ? "Yes" : "No";

    updateModalButton(item.id);

    const listBtn = document.getElementById("modalListBtn");
    if (listBtn) listBtn.onclick = () => toggleFavorite(item);

    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
}

function closeModal() {
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}

function setupModal() {
    closeModalBtn?.addEventListener("click", closeModal);

    // Click on the dimmed backdrop (not the panel itself) closes the modal.
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}


/* =============================================================================
   10. VIDEO PLAYER
   Built once in initApp() and stored on state.videoPlayer. Cards and the
   hero/modal play buttons call state.videoPlayer.playVideo(item) rather than
   re-running this setup — re-running it would re-attach every listener below
   (including the document-level keydown handler) on every single click,
   stacking duplicates that each fire independently.
   ============================================================================= */

function setupVideoPlayer() {
    const modalPlayBtn = document.getElementById("modalPlayBtn");
    const heroPlayBtn = document.getElementById("heroPlayBtn");
    const heroInfoBtn = document.getElementById("heroInfoBtn");
    const videoOverlay = document.getElementById("videoPlayerOverlay");
    const closeVideoBtn = document.getElementById("closeVideoBtn");
    const videoIframe = document.getElementById("videoIframe");

    const playVideo = (item) => {
        if (!item || !videoIframe || !videoOverlay) return;
        const type = item.type === "tv" ? "tv" : "movie";
        videoIframe.src = `https://vidsrc.to/embed/${type}/${item.id}`;
        videoOverlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    const closeVideo = () => {
        if (videoOverlay) videoOverlay.style.display = "none";
        if (videoIframe) videoIframe.src = "";
        document.body.style.overflow = "";
    };

    modalPlayBtn?.addEventListener("click", () => {
        if (modal?.classList.contains("open")) modal.classList.remove("open");
        playVideo(state.currentModalItem);
    });

    heroPlayBtn?.addEventListener("click", () => playVideo(state.currentHeroItem));
    heroInfoBtn?.addEventListener("click", () => openModal(state.currentHeroItem));
    closeVideoBtn?.addEventListener("click", closeVideo);

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (videoOverlay && videoOverlay.style.display === "flex") {
            closeVideo();
        } else if (modal?.classList.contains("open")) {
            closeModal();
        }
    });

    return {playVideo};
}


/* =============================================================================
   11. DATA LOADING
   ============================================================================= */

async function fetchMovies(type, sort) {
    try {
        const res = await fetch(`${CONFIG.API_BASE}?type=${type}&sort=${sort}`);
        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            return [];
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            console.warn(`Data returned from ${CONFIG.API_BASE} is not an array:`, data);
            return [];
        }
        return data.map((x) => ({
            id: x.id,
            title: x.title || x.name,
            isAdult: x.isAdult || x.adult === true,
            genreIds: x.genre_ids || x.genreIds || [],
            poster: x.poster || (x.poster_path ? `${CONFIG.IMG_BASE}${x.poster_path}` : ""),
            backdrop: x.backdrop || (x.backdrop_path ? `${CONFIG.BACKDROP_BASE}${x.backdrop_path}` : null),
            rating: x.rating || x.vote_average,
            year: x.year || String(x.release_date ?? x.first_air_date ?? "").slice(0, 4) || "????",
            release_date: x.release_date || x.first_air_date,
            overview: x.overview,
            type: type,
        }));
    } catch (err) {
        console.error("Fetch failed", err);
        return [];
    }
}

function processKidsContent(allContent) {
    const kidsContent = allContent.filter(isKidsMovie);
    const kidSection = document.getElementById("kid");

    if (kidsContent.length > 0) {
        renderGrid("kidGrid", kidsContent.slice(0, 12), true);
        if (kidSection) kidSection.style.display = "block";
    } else if (kidSection) {
        kidSection.style.display = "none";
    }
}

async function loadDashboardData() {
    try {
        const results = await Promise.allSettled([
            fetchMovies("movie", "top_rated"),
            fetchMovies("movie", "popular"),
            fetchMovies("movie", "now_playing"),
            fetchMovies("tv", "popular"),
        ]);

        const trending = results[0].status === "fulfilled" ? results[0].value : [];
        const popular = results[1].status === "fulfilled" ? results[1].value : [];
        const newRel = results[2].status === "fulfilled" ? results[2].value : [];
        const tvShows = results[3].status === "fulfilled" ? results[3].value : [];

        if (trending.length > 0) renderGrid("trendingGrid", trending.slice(0, 12));
        if (popular.length > 0) renderGrid("popularGrid", popular.slice(0, 12));
        if (newRel.length > 0) renderGrid("newGrid", newRel.slice(0, 12));
        if (tvShows.length > 0) renderGrid("tvGrid", tvShows.slice(0, 12));

        if (trending.length === 0) document.getElementById("trending")?.style.setProperty("display", "none");
        if (popular.length === 0) document.getElementById("movies")?.style.setProperty("display", "none");
        if (newRel.length === 0) document.getElementById("new")?.style.setProperty("display", "none");
        if (tvShows.length === 0) document.getElementById("tvshow")?.style.setProperty("display", "none");

        if (trending.length > 0) {
            updateHero(trending[Math.floor(Math.random() * trending.length)]);
        }

        const allContent = [...trending, ...popular, ...newRel, ...tvShows];
        processKidsContent(allContent);

        // De-dupe by id (a title can legitimately appear in more than one
        // category, e.g. trending AND popular) before it becomes the pool
        // that search/genre-filter/etc. read from.
        state.allLoadedMovies = Array.from(new Map(allContent.map((item) => [item.id, item])).values());
    } catch (e) {
        console.error("Dashboard loading failed entirely:", e);
    }
}


/* =============================================================================
   12. INITIALIZATION
   ============================================================================= */

function setupGlobalListeners() {
    window.addEventListener("scroll", () => {
        const header = document.getElementById("movie-header");
        if (header) header.classList.toggle("scrolled", window.scrollY > 20);
    });

    document.querySelectorAll(".row-slider-wrapper").forEach((wrapper) => {
        const leftBtn = wrapper.querySelector(".left-handle");
        const rightBtn = wrapper.querySelector(".right-handle");
        const grid = wrapper.querySelector(".row-slider");
        if (!grid) return;

        leftBtn?.addEventListener("click", () => scrollRow(grid.id, "left"));
        rightBtn?.addEventListener("click", () => scrollRow(grid.id, "right"));
    });
}

async function initApp() {
    loadFavoritesState();
    setupGlobalListeners();
    setupNavLinks();
    setupSearch();
    setupModal();
    renderMyList();
    await loadDashboardData();
    setupGenreFilter();
    // Captured on state so cardTemplate()'s play-button handler (section 04)
    // can call state.videoPlayer.playVideo(item) without re-running setup.
    state.videoPlayer = setupVideoPlayer();
}

// Handles both timings: script loaded before DOMContentLoaded fires (attach
// a listener) and script loaded after it already fired, e.g. because the
// <script> tag is deferred or sits at the end of <body> (call immediately —
// a listener registered at that point would never fire).
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}