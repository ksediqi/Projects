const express = require("express");
const router = express.Router();

let projects = [];
try {
    projects = require("../config/data.js");
} catch (e) {
    console.warn("Could not load data.js:", e.message);
}

const projectViews = {
    portfolio:  "projects/portfolio/portfolio",
    movie:      "projects/movie/movie",
    space:      "projects/space-tourism/spacehome",
    blogweba:   "projects/blogwebapp/blogweb",
    mapty:      "projects/mapty/mapty",
    filmfinder: "projects/filmfinder/filmfinder",
    bankist:    "projects/bankist/bankist",
};

router.get("/", (req, res) => {
    res.render("main", { projects: Array.isArray(projects) ? projects : [] });
});

Object.entries(projectViews).forEach(([slug, viewPath]) => {
    router.get(`/projects/${slug}`, (req, res) => res.render(viewPath));
});

// Legacy top-level aliases kept for backward compatibility
router.get("/portfolio",     (req, res) => res.render("projects/portfolio/portfolio"));
router.get("/movie",         (req, res) => res.render("projects/movie/movie"));
router.get("/space-tourism", (req, res) => res.render("projects/space-tourism/spacehome"));
router.get("/blogweba",      (req, res) => res.render("projects/blogwebapp/blogweb"));
router.get("/mapty",         (req, res) => res.render("projects/mapty/mapty"));
router.get("/socialProject", (req, res) => res.render("projects/social/socialProject"));

module.exports = router;