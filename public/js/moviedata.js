
// // public/js/movies.js
// // Enhanced MovieTheater front-end with section filtering
//
// /* =========================
//  * CONSTANTS & CONFIGURATION
//  * ========================= */
// const FALLBACK_POSTER = "https://via.placeholder.com/400x600?text=No+Image";
// const AUTO_SLIDE_INTERVAL = 5000;
// const SWIPE_THRESHOLD = 40;
//
// /* =========================
//  * UTILITY FUNCTIONS
//  * ========================= */
// const Utils = {
//     escapeHtml(s) {
//         return String(s).replace(
//             /[&<>"']/g,
//             ch => ({
//                 "&": "&amp;",
//                 "<": "&lt;",
//                 ">": "&gt;",
//                 '"': "&quot;",
//                 "'": "&#039;",
//             }[ch])
//         );
//     },
//
//     querySelector(sel, el = document) {
//         return el.querySelector(sel);
//     },
//
//     querySelectorAll(sel, el = document) {
//         return Array.from(el.querySelectorAll(sel));
//     }
// };
//
// /* =========================
//  * API SERVICE
//  * ========================= */
// const API = {
//     async getJSON(url, opts = {}) {
//         try {
//             const res = await fetch(url, opts);
//             if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//             return res.json();
//         } catch (err) {
//             console.error("API error:", err);
//             return [];
//         }
//     },
//
//     list(type, sort = "popular") {
//         return `/api/list?type=${type}&sort=${sort}`;
//     },
//
//     search(q) {
//         return `/api/search?q=${encodeURIComponent(q)}`;
//     }
// };
//
// /* =========================
//  * DATA MANAGEMENT
//  * ========================= */
// class DataManager {
//     constructor() {
//         this.moviesData = [];
//         this.tvData = [];
//         this.kidsData = [];
//         this.searchData = null;
//         this.currentSort = "default";
//     }
//
//     setMoviesData(data) {
//         this.moviesData = Array.isArray(data) ? data : data.results || [];
//     }
//
//     setTvData(data) {
//         this.tvData = Array.isArray(data) ? data : data.results || [];
//     }
//
//     setSearchData(data) {
//         this.searchData = Array.isArray(data) ? data : data.results || [];
//     }
//
//     clearSearchData() {
//         this.searchData = null;
//     }
//
//     setSortMode(mode) {
//         this.currentSort = mode;
//     }
//
//     isSearchActive() {
//         return this.searchData !== null;
//     }
// }
//
// /* =========================
//  * ITEM RENDERER
//  * ========================= */
// class ItemRenderer {
//     normalizeItem(raw, fallbackType) {
//         const title = raw.title || raw.name || "Untitled";
//         const year = raw.year ||
//             (raw.release_date || raw.first_air_date || raw.year || "").slice(0, 4) || "";
//         const rating = raw.rating != null
//             ? Number(raw.rating)
//             : raw.vote_average != null
//                 ? Number(raw.vote_average)
//                 : null;
//
//         let poster = raw.poster;
//         if (!poster && raw.poster_path) {
//             poster = `https://image.tmdb.org/t/p/w400${raw.poster_path}`;
//         }
//
//         const type = raw.type || raw.media_type ||
//             (raw.first_air_date ? "tv" : fallbackType || "movie");
//
//         return {title, year, rating, poster, type};
//     }
//
//     generateCardHTML(item) {
//         const {title, year, rating, poster, type} = item;
//         const posterSrc = poster || FALLBACK_POSTER;
//         const typeLabel = type === "tv" || type === "TV" ? "TV" : "Movie";
//         const ratingLabel = typeof rating === "number" && !Number.isNaN(rating)
//             ? rating.toFixed(1)
//             : "N/A";
//
//         return `
//             <div class="lib-card">
//                 <crew-img class="lib-thumb" src="${posterSrc}" alt="${Utils.escapeHtml(title)}"
//                      loading="lazy" decoding="async">
//                 <div class="lib-body">
//                     <h3 class="lib-title-sm">${Utils.escapeHtml(title)}</h3>
//                     <p class="lib-meta">
//                         ${year ? `${year} · ` : ""}
//                         <i class="fa-solid fa-star"></i> ${ratingLabel}
//                     </p>
//                     <div class="lib-badges">
//                         <span class="lib-badge">${Utils.escapeHtml(typeLabel)}</span>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
//
//     sortItems(items, sortKey) {
//         const arr = items.slice();
//
//         switch (sortKey) {
//             case "title":
//                 arr.sort((a, b) => a.title.localeCompare(b.title));
//                 break;
//             case "year":
//                 arr.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
//                 break;
//             case "rating":
//                 arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//                 break;
//         }
//
//         return arr;
//     }
//
//     renderGrid(grid, items, fallbackType, sortMode) {
//         if (!grid) return;
//
//         const normalized = items.map(it => this.normalizeItem(it, fallbackType));
//         const sorted = sortMode === "default"
//             ? normalized
//             : this.sortItems(normalized, sortMode);
//
//         grid.innerHTML = sorted.map(item => this.generateCardHTML(item)).join("");
//     }
// }
//
// /* =========================
//  * HERO SLIDER
//  * ========================= */
// class HeroSlider {
//     constructor(sliderElement) {
//         this.slider = sliderElement;
//         this.slidesContainer = sliderElement?.querySelector(".lib-slides");
//         this.slideImages = this.slidesContainer
//             ? Array.from(this.slidesContainer.querySelectorAll("crew-img"))
//             : [];
//         this.prevBtn = sliderElement?.querySelector(".lib-slide-btn.prev");
//         this.nextBtn = sliderElement?.querySelector(".lib-slide-btn.next");
//         this.dotsContainer = sliderElement?.querySelector(".lib-dots");
//
//         this.current = 0;
//         this.timer = null;
//         this.startX = 0;
//         this.deltaX = 0;
//     }
//
//     init() {
//         if (!this.slider || !this.slidesContainer ||
//             this.slideImages.length === 0 || !this.dotsContainer) {
//             return;
//         }
//
//         this.buildDots();
//         this.attachEventListeners();
//         this.goTo(0);
//         this.startAuto();
//     }
//
//     buildDots() {
//         this.dotsContainer.innerHTML = "";
//         this.slideImages.forEach((_, idx) => {
//             const dot = document.createElement("button");
//             dot.type = "button";
//             dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
//             dot.addEventListener("click", () => this.goTo(idx));
//             this.dotsContainer.appendChild(dot);
//         });
//     }
//
//     updateDots() {
//         const dots = this.dotsContainer.querySelectorAll("button");
//         dots.forEach((dot, idx) => {
//             if (idx === this.current) {
//                 dot.setAttribute("aria-current", "true");
//             } else {
//                 dot.removeAttribute("aria-current");
//             }
//         });
//     }
//
//     goTo(index) {
//         const total = this.slideImages.length;
//         this.current = (index + total) % total;
//         this.slidesContainer.style.transform = `translateX(-${this.current * 100}%)`;
//         this.updateDots();
//     }
//
//     next() {
//         this.goTo(this.current + 1);
//     }
//
//     prev() {
//         this.goTo(this.current - 1);
//     }
//
//     startAuto() {
//         if (this.timer) return;
//         this.timer = setInterval(() => this.next(), AUTO_SLIDE_INTERVAL);
//     }
//
//     stopAuto() {
//         if (!this.timer) return;
//         clearInterval(this.timer);
//         this.timer = null;
//     }
//
//     attachEventListeners() {
//         this.prevBtn?.addEventListener("click", () => this.prev());
//         this.nextBtn?.addEventListener("click", () => this.next());
//
//         this.slider.addEventListener("mouseenter", () => this.stopAuto());
//         this.slider.addEventListener("mouseleave", () => this.startAuto());
//
//         // Touch swipe handlers
//         this.slidesContainer.addEventListener("touchstart", (e) => {
//             const t = e.touches[0];
//             this.startX = t.clientX;
//             this.deltaX = 0;
//             this.stopAuto();
//         }, {passive: true});
//
//         this.slidesContainer.addEventListener("touchmove", (e) => {
//             const t = e.touches[0];
//             this.deltaX = t.clientX - this.startX;
//         }, {passive: true});
//
//         this.slidesContainer.addEventListener("touchend", () => {
//             if (Math.abs(this.deltaX) > SWIPE_THRESHOLD) {
//                 if (this.deltaX < 0) {
//                     this.next();
//                 } else {
//                     this.prev();
//                 }
//             }
//             this.startAuto();
//         });
//
//         window.addEventListener("resize", () => this.goTo(this.current));
//     }
// }
//
// /* =========================
//  * MAIN APPLICATION
//  * ========================= */
// class MovieTheaterApp {
//     constructor() {
//         this.app = document.querySelector(".library-app");
//         if (!this.app) return;
//
//         this.$ = (sel) => Utils.querySelector(sel, this.app);
//         this.$$ = (sel) => Utils.querySelectorAll(sel, this.app);
//
//         this.dataManager = new DataManager();
//         this.renderer = new ItemRenderer();
//
//         this.initDOMReferences();
//         this.initEventListeners();
//         this.initSlider();
//
//         this.showSection("movies");
//         this.loadInitialData();
//     }
//
//     initDOMReferences() {
//         this.kidsGrid = this.kidsSection?.querySelector(".lib-grid");
//         this.sections = this.$$(".lib-section");
//         this.moviesSection = this.sections[0];
//         this.tvSection = this.sections[1];
//         this.kidsSection = this.sections[2];
//
//         this.moviesGrid = this.moviesSection?.querySelector(".lib-grid");
//         this.tvGrid = this.tvSection?.querySelector(".lib-grid");
//
//         this.sortSelect = this.$("#sort-by");
//         this.searchForm = this.$(".lib-search");
//         this.searchInput = this.searchForm?.querySelector("input[type='search']");
//
//         this.navLinksWrapper = this.$(".lib-links");
//         this.navLinks = this.navLinksWrapper?.querySelectorAll(".lib-link") || [];
//
//         this.menuToggle = this.$(".lib-menu-toggle");
//         this.viewButtons = this.$$(".lib-view-btn");
//     }
//
//     initEventListeners() {
//         this.initNavigationLinks();
//         this.initMobileMenu();
//         this.initViewToggle();
//         this.initSearch();
//         this.initSort();
//     }
//
//     initNavigationLinks() {
//         this.navLinks.forEach(link => {
//             const href = link.getAttribute("href") || "";
//             const targetId = href.startsWith("#") ? href.slice(1) : null;
//
//             link.addEventListener("click", (e) => {
//                 e.preventDefault();
//
//                 // Update active state
//                 this.navLinks.forEach(l => l.classList.remove("is-active"));
//                 link.classList.add("is-active");
//
//                 // Show appropriate section
//                 if (targetId) {
//                     this.showSection(targetId);
//
//                     // Smooth scroll to top of main content
//                     const mainContent = this.$(".lib-main");
//                     mainContent?.scrollIntoView({behavior: "smooth", block: "start"});
//                 }
//             });
//         });
//     }
//
//     initMobileMenu() {
//         if (this.menuToggle && this.navLinksWrapper) {
//             this.menuToggle.addEventListener("click", () => {
//                 const isOpen = this.navLinksWrapper.classList.toggle("is-open");
//                 this.menuToggle.setAttribute("aria-expanded", String(isOpen));
//             });
//         }
//     }
//
//     initViewToggle() {
//         this.viewButtons.forEach(btn => {
//             btn.addEventListener("click", () => {
//                 const label = (btn.getAttribute("aria-label") || "").toLowerCase();
//                 const mode = label.includes("list") ? "list" : "grid";
//
//                 this.viewButtons.forEach(b => b.classList.remove("is-active"));
//                 btn.classList.add("is-active");
//
//                 this.$$(".lib-card").forEach(card => {
//                     card.classList.toggle("list", mode === "list");
//                 });
//             });
//         });
//     }
//
//     initSearch() {
//         if (!this.searchForm) return;
//
//         this.searchForm.addEventListener("submit", (e) => {
//             e.preventDefault();
//             const query = (this.searchInput?.value || "").trim();
//
//             if (!query) {
//                 this.dataManager.clearSearchData();
//                 this.applySortAndRender();
//                 return;
//             }
//
//             // Switch to movies section for search results
//             this.showSection("movies");
//             this.navLinks.forEach(l => l.classList.remove("is-active"));
//             const moviesLink = Array.from(this.navLinks).find(l =>
//                 l.getAttribute("href") === "#movies"
//             );
//             if (moviesLink) moviesLink.classList.add("is-active");
//
//             this.runSearch(query);
//         });
//     }
//
//     initSort() {
//         if (!this.sortSelect) return;
//
//         this.sortSelect.addEventListener("change", () => {
//             this.dataManager.setSortMode(this.sortSelect.value || "default");
//             this.applySortAndRender();
//         });
//     }
//
//     initSlider() {
//         const sliderElement = this.$(".lib-slider");
//         if (sliderElement) {
//             const slider = new HeroSlider(sliderElement);
//             slider.init();
//         }
//     }
//
//     showSection(sectionName) {
//         // Hide all sections
//         this.sections.forEach(section => {
//             section.style.display = "none";
//         });
//
//         // Show the active section
//         const sectionMap = {
//             movies: this.moviesSection,
//             tv: this.tvSection,
//             kids: this.kidsSection
//         };
//
//         const targetSection = sectionMap[sectionName];
//         if (targetSection) {
//             targetSection.style.display = "block";
//         }
//
//         // Clear search when switching sections
//         this.dataManager.clearSearchData();
//         if (this.searchInput) this.searchInput.value = "";
//     }
//
//     applySortAndRender() {
//         if (this.dataManager.isSearchActive()) {
//             this.renderer.renderGrid(
//                 this.kidsGrid,
//                 this.dataManager.kidsData,
//                 this.moviesGrid,
//                 this.dataManager.searchData,
//                 "movie",
//                 this.dataManager.currentSort
//             );
//         } else {
//             this.renderer.renderGrid(
//                 this.moviesGrid,
//                 this.dataManager.moviesData,
//                 "movie",
//                 this.dataManager.currentSort
//             );
//             this.renderer.renderGrid(
//                 this.tvGrid,
//                 this.dataManager.tvData,
//                 "tv",
//                 this.dataManager.currentSort
//             );
//         }
//     }
//
//     async loadInitialData() {
//         if (!this.moviesGrid || !this.tvGrid) return;
//
//         this.moviesGrid.innerHTML = "<p>Loading movies…</p>";
//         this.tvGrid.innerHTML = "<p>Loading TV shows…</p>";
//
//         try {
//             const [movies, tv] = await Promise.all([
//                 API.getJSON(API.list("movie", "popular")),
//                 API.getJSON(API.list("tv", "popular")),
//             ]);
//
//             this.dataManager.setMoviesData(movies);
//             this.dataManager.setTvData(tv);
//             this.dataManager.clearSearchData();
//
//             this.applySortAndRender();
//         } catch (err) {
//             console.error("Failed to load initial data:", err);
//             this.moviesGrid.innerHTML =
//                 "<p class='lib-meta'>Failed to load movies. Please try again later.</p>";
//             this.tvGrid.innerHTML =
//                 "<p class='lib-meta'>Failed to load TV shows. Please try again later.</p>";
//         }
//     }
//
//     async runSearch(query) {
//         if (!this.moviesGrid) return;
//
//         this.moviesGrid.innerHTML = "<p>Searching…</p>";
//
//         try {
//             const res = await API.getJSON(API.search(query));
//             this.dataManager.setSearchData(res);
//             this.applySortAndRender();
//         } catch (err) {
//             console.error("Search failed:", err);
//             this.moviesGrid.innerHTML =
//                 "<p class='lib-meta'>Search failed. Please try again.</p>";
//         }
//     }
// }
//
// /* =========================
//  * INITIALIZATION
//  * ========================= */
// document.addEventListener("DOMContentLoaded", () => {
//     // Initialize main app
//     new MovieTheaterApp();
//
//     // Mobile menu toggle (legacy support)
//     const menuBtn = document.querySelector('.menu-btn');
//     const navLinks2 = document.querySelector('.library-app .nav-links');
//     if (menuBtn && navLinks2) {
//         menuBtn.addEventListener('click', () => {
//             menuBtn.classList.toggle('active');
//             navLinks2.classList.toggle('is-open');
//         });
//     }
// });
//
