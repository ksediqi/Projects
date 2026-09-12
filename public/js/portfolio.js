"use strict";
// DOM Elements

const sections = document.querySelectorAll(".section");
const tabs = document.querySelectorAll(".operations__tab");
const tabsContainer = document.querySelector(".operations__tab-container");
const tabsContent = document.querySelectorAll(".operations__content");
// const nav = document.querySelector(".navbar");
// const header = document.getElementById("header");
const porto_Navbar = document.querySelector('.porto-navbar');

// Prevent default scroll restoration
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
    //sources
    //https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration?utm_source=chatgpt.com

}


// Smooth scrolling for navigation

const initSmoothScroll = (options = {}) => {
    const {

        navSelector = [".navbar", ".porto-navbar"],
        hamburgerSelector = ".porto-hamburger",
        navLinksSelector = ".nav-links",
        offset = 10,
        behavior = "smooth"
    } = options;

    // Cache DOM elements
    const nav = document.querySelector(navSelector);
    const navHeight = nav ? nav.offsetHeight : 0;
    const totalOffset = offset + navHeight;

    const closeMobileMenu = () => {
        const hamburger = document.querySelector(hamburgerSelector);
        const navLinks = document.querySelector(navLinksSelector);

        if (hamburger?.classList.contains("active") && navLinks?.classList.contains("active")) {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        }
    };

    const scrollToElement = (target) => {
        // Use IntersectionObserver for better performance if needed
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const offsetPosition = absoluteTop - totalOffset;

        // Handle edge case: if scroll position is negative
        const finalPosition = Math.max(0, offsetPosition);

        window.scrollTo({
            top: finalPosition,
            behavior
        });
    };

    // Use event delegation for better performance with dynamic content
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const targetID = anchor.getAttribute("href");
        if (!targetID || targetID === "#") return;

        const target = document.querySelector(targetID);
        if (!target) return;

        e.preventDefault();

        // Close mobile menu
        closeMobileMenu();

        // Scroll to target
        scrollToElement(target);
    });
};
// Initialize scroll handling

// Tabbed component

const initTabbedComponent = () => {


    if (!tabsContainer) return;

    tabsContainer.addEventListener("click", (e) => {
        const clicked = e.target.closest(".operations__tab");
        if (!clicked) return;

        // Remove active classes
        tabs.forEach((t) => t.classList.remove("operations__tab--active"));
        tabsContent.forEach((c) =>
            c.classList.remove("operations__content--active")
        );

        // Activate tab
        clicked.classList.add("operations__tab--active");

        // Activate content area - using data-tab attribute
        const tabNumber = clicked.dataset.tab;
        const targetContent = document.querySelector(
            `.operations__content[data-tab="${tabNumber}"]`
        );

        if (targetContent) {
            targetContent.classList.add("operations__content--active");
        }
    });
};


//  Reveal Sections
//
// const allSections = document.querySelectorAll('.section');
// // const sectionHeight = allSections.getBoundingClientRect().height;
// const revealSection = (entries, Observer) => {
//     if (!Array.isArray(entries) || entries.length === 0) return;
//     const [entry] = entries;
//
//     if (!entry.isIntersecting) return;
//
//     entry.target.classList.remove('section--hidden');
//     Observer.unobserve(entry.target)
// }
//
// const sectionObserver = new IntersectionObserver(revealSection, {
//     root: null,
//     threshold: 0.15,
//     // rootMargin: `-${sectionHeight}px`,
// });
//
//
// allSections.forEach((section) => {
//     sectionObserver.observe(section);
//     section.classList.add('section--hidden');
//
// })

// Scroll progress bar
document.addEventListener("DOMContentLoaded", () => {
    const hrs = document.querySelectorAll(".scroll-hr");
    console.log(hrs)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = "100%";
            } else {
                entry.target.style.width = "0%";
            }

        });
    }, {threshold: 0.4}); // triggers when 40% visible

    hrs.forEach(hr => observer.observe(hr));
});


// Slider
const initSlider = () => {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = document.querySelectorAll(".slide");
    const btnLeft = document.querySelector(".slider__btn--left");
    const btnRight = document.querySelector(".slider__btn--right");
    const dotContainer = document.querySelector(".dots");

    if (!slides.length || !btnLeft || !btnRight || !dotContainer) return;

    let curSlide = 0;
    const maxSlide = slides.length;

    // Functions
    const createDots = () => {
        slides.forEach((_, i) => {
            dotContainer.insertAdjacentHTML(
                "beforeend",
                `<button class="dots__dot" data-slide="${i}"></button>`
            );
        });
    };

    const activateDot = (slide) => {
        document
            .querySelectorAll(".dots__dot")
            .forEach((dot) => dot.classList.remove("dots__dot--active"));

        document
            .querySelector(`.dots__dot[data-slide="${slide}"]`)
            ?.classList.add("dots__dot--active");
    };

    const goToSlide = (slide) => {
        slides.forEach(
            (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
        );
    };

    // Next slide
    const nextSlide = () => {
        if (curSlide === maxSlide - 1) {
            curSlide = 0;
        } else {
            curSlide++;
        }

        goToSlide(curSlide);
        activateDot(curSlide);
    };

    // Previous slide
    const prevSlide = () => {
        if (curSlide === 0) {
            curSlide = maxSlide - 1;
        } else {
            curSlide--;
        }
        goToSlide(curSlide);
        activateDot(curSlide);
    };

    const init = () => {
        goToSlide(0);
        createDots();
        activateDot(0);

        // Set up autoplay
        setInterval(nextSlide, 5000);
    };

    init();

    // Event handlers
    btnRight.addEventListener("click", nextSlide);
    btnLeft.addEventListener("click", prevSlide);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
    });

    dotContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("dots__dot")) {
            const {slide} = e.target.dataset;
            goToSlide(slide);
            activateDot(slide);
            curSlide = +slide;
        }
    });
};

// Modal functionality
const initModals = () => {
    const modal = document.querySelector(".modal-overlay");
    const btnCloseModal = document.querySelector(".modal-close");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    if (!modal) return;

    // Show modal on page load
    setTimeout(() => {
        modal.classList.remove("hidden");
    }, 1000);

    const closeModal = () => {
        modal.classList.add("hidden");
    };

    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });
};


// Initialize when DOM is fully loaded


// Update copyright year
const updateCopyrightYear = () => {
    const currentYearElem = document.getElementById("current-year");
    if (currentYearElem) {
        currentYearElem.textContent = new Date().getFullYear();
    }
};

// Resume download functionality
const initResumeDownload = () => {
    const downloadBtn = document.getElementById("resumeDownloadBtn");
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", function () {
        const btn = this;
        btn.classList.add("loading");

        // Simulate download process
        setTimeout(() => {
            // Create and trigger an actual download
            const link = document.createElement("a");
            link.href = '/public/docs/Jamshid_Sediqi_Resume.pdf'; // Update with your actual path
            link.download = 'Jamshid_Sediqi_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Reset button
            setTimeout(() => {
                btn.classList.remove("loading");
            }, 1000);
        }, 1500);
    });
};

// Form submission handling
const initContactForm = () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Here you would typically send the data to your server
            console.log('Form data:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Show a success message
            alert("Thank you for your message! I will get back to you soon.");
            contactForm.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("There was an error sending your message. Please try again.");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });


};

// const initHeroThemePicker = () => {
//   const THEMES  = ['theme-red', 'theme-green', 'theme-blue'];
//   const STORAGE_KEY = 'portoTheme';
//
//   function applyTheme(theme) {
//     // We check if we are already applying the requested theme to avoid unnecessary DOM updates
//     if (theme && document.body.classList.contains(theme)) return;
//
//     // Remove all theme classes first
//     THEMES.forEach(t => document.body.classList.remove(t));
//     document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
//
//     if (theme) {
//       document.body.classList.add(theme);
//       const active = document.querySelector(`.theme-swatch[data-theme="${theme}"]`);
//       if (active) active.classList.add('active');
//       try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
//     } else {
//       try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
//     }
//   }
//
//   // Restore saved preference on load
//   try {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved && THEMES.includes(saved)) applyTheme(saved);
//   } catch (_) {}
//
//   // Wire up swatch buttons
//   document.querySelectorAll('.theme-swatch[data-theme]').forEach(function (btn) {
//     btn.addEventListener('click', function () {
//       const theme = btn.dataset.theme;
//       // Clicking the active swatch toggles it off
//       document.body.classList.contains(theme) ? applyTheme(null) : applyTheme(theme);
//     });
//   });
//
//   // Wire up reset button
//   const resetBtn = document.getElementById('swatch-reset');
//   if (resetBtn) {
//       resetBtn.addEventListener('click', function() {
//           applyTheme(null);
//       });
//   }
// };
const initExploreMoreProjects = () => {
    const exploreBtn = document.getElementById("explore-more-projects");
    const hiddenProjects = document.querySelectorAll(".project-hidden");

    if (!exploreBtn || !hiddenProjects.length) return;

    let projectsExpanded = false;

    exploreBtn.addEventListener("click", () => {
        projectsExpanded = !projectsExpanded;

        hiddenProjects.forEach((project, index) => {
            setTimeout(() => {
                project.classList.toggle("project-visible", projectsExpanded);
            }, index * 120);
        });

        exploreBtn.textContent = projectsExpanded ? "Less" : "More";

        const scrollTarget = projectsExpanded
            ? hiddenProjects[0]                              // scroll to first new project
            : document.getElementById("project-section");   // scroll back to section top

        // wait for the last staggered animation to start before scrolling
        // const delay = projectsExpanded ? hiddenProjects.length * 50 : 100;

        if (projectsExpanded) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    hiddenProjects[0]?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                });
            });
        } else {
            setTimeout(() => {
                document.getElementById("project-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    });
};


// Initialize all functions when DOM is loaded
// Initialize all functions when DOM is loaded, but ONLY if we are on the portfolio page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the portfolio page by looking for a unique element
    if (document.querySelector('.porto-navbar') || document.getElementById('about')) {
        initSmoothScroll();
        initTabbedComponent();
        // initMenuFade();
        // initMenuFadeTab();
        initSlider();
        initModals();
        // initMobileMenu();
        updateCopyrightYear();
        initResumeDownload();
        initContactForm();
        // initHeroThemePicker();
        initExploreMoreProjects();
    }
});


// Helper: Toast Notification
const showToast = (message) => {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
};

// Interactive Code Window Playground Copy
const initCodePlayground = () => {
    const copyBtn = document.getElementById("copy-code-btn");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", () => {
        const codeText = `const developer = {
  name: "Jamshid Sediqi",
  title: "Full Stack Web Developer",
  focus: "impactful digital experiences",
  frontend: ["HTML", "CSS", "JavaScript", "React"],
  backend: ["Node.js", "Express", "REST APIs"],
  database: ["MongoDB", "PostgreSQL"],
  greet() {
    return \`Hi! I'm \${this.name}. Let's build something great.\`;
  }
};`;
        navigator.clipboard.writeText(codeText).then(() => {
            copyBtn.innerHTML = "<span>✓</span> Copied!";
            showToast("Skills code snippet copied to clipboard!");
            setTimeout(() => {
                copyBtn.innerHTML = "<span>📋</span> Copy";
            }, 2000);
        }).catch(() => {
            showToast("Failed to copy snippet.");
        });
    });
};

// Project Category Filtering
const initProjectFilter = () => {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-showcase-card");

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            projectCards.forEach((card) => {
                const category = card.dataset.category || "all";
                if (filter === "all" || category === filter) {
                    card.style.display = "flex";
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 300);
                }
            });
        });
    });
};

// Project Quick-View Modal
const initProjectModal = () => {
    const modal = document.getElementById("project-detail-modal");
    const modalClose = document.getElementById("project-modal-close");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalTags = document.getElementById("modal-tags");
    const openBtns = document.querySelectorAll(".btn-open-modal");

    if (!modal || !modalClose) return;

    const projectDetails = {
        "01": {
            title: "Library Management System",
            desc: "A full-featured digital library platform built with React, Node.js, and MongoDB. Features secure JWT authentication, book circulation tracking, catalog search, fine calculation, and comprehensive admin dashboard analytics.",
            tags: ["React", "Node.js", "Express", "MongoDB", "REST API", "Tailwind CSS"],
            link: "/projects/library"
        },
        "02": {
            title: "Real-Time Messaging App",
            desc: "A modern real-time messaging application powered by React and Firebase. Includes custom user profiles, direct messaging, group chat rooms, online status indicators, and message history persistence.",
            tags: ["React", "Firebase", "WebSockets", "Tailwind CSS", "JavaScript"],
            link: "/projects/portfolio"
        },
        "03": {
            title: "Task Manager Productivity Suite",
            desc: "Productivity & task management tool built with Vue.js, Express, and MongoDB. Features interactive drag-and-drop Kanban boards, task categorization, priority tags, and visual progress tracking.",
            tags: ["Vue.js", "Express", "Node.js", "MongoDB", "Drag & Drop UI"],
            link: "/projects/portfolio"
        },
        "04": {
            title: "SEO Medicine Website",
            desc: "A high-performance, search-engine optimized healthcare platform designed for high visibility, clean mobile UX, responsive layout architecture, and fast load times.",
            tags: ["HTML5", "CSS3", "JavaScript", "SEO", "Responsive Design"],
            link: "/projects/portfolio"
        },
        "05": {
            title: "Modern Restaurant Landing Web App",
            desc: "Contemporary restaurant web application featuring interactive digital menus, online table reservation, vibrant food showcase galleries, and mobile-friendly navigation.",
            tags: ["HTML5", "CSS Grid", "Figma", "UI/UX", "JavaScript"],
            link: "/projects/portfolio"
        },
        "06": {
            title: "Design For Agriculture Platform",
            desc: "Clean digital concept for agricultural services and farm management. Designed with accessibility standards, dark mode theme support, natural color palette, and bold component design.",
            tags: ["Figma", "UI Design", "UX Research", "Accessibility", "Design System"],
            link: "/projects/portfolio"
        }
    };

    openBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const projId = btn.dataset.project || "01";
            const data = projectDetails[projId] || projectDetails["01"];

            if (modalTitle) modalTitle.textContent = data.title;
            if (modalDesc) modalDesc.textContent = data.desc;
            if (modalTags) {
                modalTags.innerHTML = data.tags
                    .map((t) => `<span class="tag tag-green">${t}</span>`)
                    .join("");
            }

            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
        });
    });

    modalClose.addEventListener("click", () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
        }
    });
};

// Back to Top Button
const initBackToTop = () => {
    const backBtn = document.getElementById("back-to-top");
    if (!backBtn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backBtn.classList.add("visible");
        } else {
            backBtn.classList.remove("visible");
        }
    });

    backBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
};

// Initialize interactive functions
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.porto-navbar') || document.getElementById('about')) {
        initScrollReveal();
        initSmoothScroll();
        initTabbedComponent();
        initSlider();
        initModals();
        updateCopyrightYear();
        initResumeDownload();
        initContactForm();
        initExploreMoreProjects();
        initCodePlayground();
        initProjectFilter();
        initProjectModal();
        initBackToTop();
    }
});

const resumeToggleBtn = document.getElementById('download-btn');
const resumeContainer = document.getElementById('resume-container');
if (resumeToggleBtn && resumeContainer) {
    resumeToggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const isHidden = resumeContainer.classList.toggle('hidden');
        resumeToggleBtn.textContent = isHidden ? 'View-Full' : 'Hide';
    });
}