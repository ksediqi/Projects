/* ── Smooth scroll ───────────────────────────────────────────── */
function smoothScroll(e, id) {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const nav = document.getElementById('libNav');
    const navHeight = nav ? nav.offsetHeight : 0;
    const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({top: y, behavior: 'smooth'});
    // Close mobile menu
    document.getElementById('libNavLinks').classList.remove('open');
    document.getElementById('libHamburger').setAttribute('aria-expanded', 'false');
}

/* ── Nav scroll effect ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('libNav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    /* ── Hamburger ───────────────────────────────────────────────── */
    const hamburger = document.getElementById('libHamburger');
    const navLinks = document.getElementById('libNavLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('open');
        });
    }

    /* ── Scroll reveal ───────────────────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, {threshold: 0.1});
        revealEls.forEach(el => observer.observe(el));
    }
});