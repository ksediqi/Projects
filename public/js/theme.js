document.addEventListener('DOMContentLoaded', function () {

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById("theme-toggle");
    const root = document.documentElement;

    const sunIcon = "<i class='fas fa-sun'></i>";
    const moonIcon = "<i class='fas fa-moon'></i>";

    // Load saved theme or fall back to system preference
    let savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
        savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    root.setAttribute("data-theme", savedTheme);

    // Guard: only run if the toggle button exists on this page
    if (themeToggle) {
        themeToggle.innerHTML = savedTheme === "dark" ? sunIcon : moonIcon;

        themeToggle.addEventListener("click", () => {
            const currentTheme = root.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            const applyTheme = () => {
                root.setAttribute("data-theme", newTheme);
                localStorage.setItem("theme", newTheme);
                themeToggle.innerHTML = newTheme === "dark" ? sunIcon : moonIcon;
            };

            // View Transitions API — circle ripple from the button
            const REDUCED = window.matchMedia("(prefers-color-scheme: dark)"); // you already have this pattern
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (!document.startViewTransition || reducedMotion) {
                applyTheme();
                return;
            }


            const {left, top, width, height} = themeToggle.getBoundingClientRect();
            const x = left + width / 2;
            const y = top + height / 2;
            const radius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const vt = document.startViewTransition(applyTheme);

            vt.ready.then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${radius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 550,
                        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                        pseudoElement: "::view-transition-new(root)",
                    }
                );
            });
        });
    }

    // Respond to OS-level theme changes only if the user hasn't manually chosen
    // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    //     if (!localStorage.getItem("theme")) {
    //         const newTheme = e.matches ? "dark" : "light";
    //         root.setAttribute("data-theme", newTheme);
    //         if (themeToggle) {
    //             themeToggle.innerHTML = newTheme === "dark" ? sunIcon : moonIcon;
    //         }
    //     }
    // });


    // ===== NAVBAR HOVER FADE =====
    // Fades out sibling links when hovering over one nav link
    const navbars = document.querySelectorAll(".navbar");

    const makeMouseOverFading = (opacity) => (e) => {
        if (e.target.classList.contains("nav-link")) {
            e.target
                .closest(".navbar")
                ?.querySelectorAll(".nav-link")
                .forEach(el => {
                    if (el !== e.target) el.style.opacity = opacity;
                });
        }
    };

    navbars.forEach(nav => {
        nav.addEventListener("mouseover", makeMouseOverFading(0.5));
        nav.addEventListener("mouseout", makeMouseOverFading(1));
    });


    // ===== SIDEBAR NAVIGATION =====
    const sidebar = document.getElementById('portfolio-nav'); // id, not class
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    const toggleSidebar = () => {
        if (sidebar) sidebar.classList.toggle('show');
    };

    if (openBtn) openBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking outside it
    document.addEventListener('click', (e) => {
        if (
            sidebar &&
            sidebar.classList.contains('show') &&
            !sidebar.contains(e.target) &&
            openBtn && !openBtn.contains(e.target)
        ) {
            sidebar.classList.remove('show');
        }
    });


    // ===== LAZY LOADING IMAGES =====
    // Lazy loading images
    const imgTargets = document.querySelectorAll('img[data-src]');

    const loadImg = function (entries, observer) {
        const [entry] = entries;

        if (!entry.isIntersecting) return;

        // Replace src with data-src
        entry.target.src = entry.target.dataset.src;

        entry.target.addEventListener('load', function () {
            entry.target.classList.remove('lazy-img');
        });

        observer.unobserve(entry.target);
    };

    const imgObserver = new IntersectionObserver(loadImg, {
        root: null,
        threshold: 0,
        rootMargin: '50px',
    });

    imgTargets.forEach(img => imgObserver.observe(img));


    // ===== STICKY NAVIGATION =====

    const porto_Header = document.getElementById("porto-header");
    const movie_Header = document.getElementById("movie-header");
    const lib_Header = document.getElementById("lib-header");
    const nav = document.querySelector('.sticky-nav');
    const header = porto_Header || movie_Header || lib_Header;

    if (nav && header) {
        const navHeight = nav.getBoundingClientRect().height;

        const headerObserver = new IntersectionObserver(
            ([entry]) => {
                const stuck = !entry.isIntersecting;
                nav.classList.toggle("sticky", stuck);
                if (porto_Header) porto_Header.classList.toggle("sticky", stuck);
                if (movie_Header) movie_Header.classList.toggle("sticky", stuck);
                if (lib_Header) lib_Header.classList.toggle("sticky", stuck);
            },
            {root: null, threshold: 0, rootMargin: `-${navHeight}px`}
        );

        headerObserver.observe(header);
        // ===== STICKY NAVIGATION ENDS HERE =====

        // Smooth scrolling for anchor links inside this nav
        // nav.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        //     anchor.addEventListener("click", function (e) {
        //         const href = this.getAttribute("href");
        //         if (!href || href === "#") return;
        //
        //         const target = document.querySelector(href);
        //         if (!target) return;
        //
        //         e.preventDefault();
        //
        //         const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        //         window.scrollTo({top: y, behavior: "smooth"});
        //
        //         nav.querySelectorAll('a[href^="#"]').forEach(l => l.classList.remove("active-link"));
        //         this.classList.add("active-link");
        //     });
        // });
    }
});


// ===== ACCORDION =====
// Guarded: only runs if #accordion exists on this page
const accordion = document.getElementById("accordion");

if (accordion) {
    const items = accordion.querySelectorAll(".info-badge");

    function closeAll() {
        items.forEach(item => {
            item.classList.remove("active");
            const content = item.querySelector(".import-info");
            if (content) content.style.maxHeight = null;
        });
    }

    items.forEach(item => {
        const button = item.querySelector(".info-button");
        const content = item.querySelector(".import-info");

        if (!button || !content) return;

        button.addEventListener("click", (e) => {
            e.stopPropagation();

            const isActive = item.classList.contains("active");
            closeAll();

            if (!isActive) {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Close accordion when clicking outside
    document.addEventListener("click", (e) => {
        if (!accordion.contains(e.target)) closeAll();
    });
}


const banner = document.getElementById('zombie-cookie-banner');
const buttons = document.querySelectorAll('.banner-btn');

// Loop through every button
buttons.forEach(button => {

    // Listen for a click on ANY of the buttons
    button.addEventListener('click', () => {

        // 1. Hide the banner by adding the 'hidden' CSS class
        banner.classList.add('hidden');


    });

});