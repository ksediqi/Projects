const express = require("express");
const router = express.Router();
const axios = require("axios");

// Open Library does not require an API key.
// This route exposes two endpoints:
//
// GET /api/openlibrary/featured
// GET /api/openlibrary/search?q=...
//

function mapOpenLibraryDoc(doc) {
    const coverId = doc.cover_i;
    const isbn = Array.isArray(doc.isbn) && doc.isbn.length ? doc.isbn[0] : null;
    const id = doc.key || isbn || `${doc.title || "book"}-${doc.first_publish_year || "unknown"}`;

    return {
        id,
        title: doc.title || "Untitled",
        authors: Array.isArray(doc.author_name) ? doc.author_name : [],
        description: doc.first_sentence
            ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence)
            : "",
        thumbnail: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "",
        rating: 0,
        ratingCount: 0,
        pageCount: doc.number_of_pages_median || 0,
        published: doc.first_publish_year ? String(doc.first_publish_year) : "",
        categories: Array.isArray(doc.subject) ? doc.subject.slice(0, 5) : [],
        infoLink: doc.key ? `https://openlibrary.org${doc.key}` : (isbn ? `https://openlibrary.org/isbn/${isbn}` : "")
    };
}

router.get("/api/openlibrary/featured", async (req, res) => {
    try {
        const response = await axios.get("https://openlibrary.org/search.json", {
            params: {
                q: "bestsellers",
                limit: 24
            }
        });

        const docs = Array.isArray(response.data.docs) ? response.data.docs : [];
        res.json({
            results: docs.map(mapOpenLibraryDoc),
            totalItems: response.data.numFound || docs.length
        });
    } catch (err) {
        console.error("Open Library featured error:", err.message);
        res.status(500).json({
            message: "Unable to load featured books from Open Library."
        });
    }
});

router.get("/api/openlibrary/search", async (req, res) => {
    try {
        const q = (req.query.q || "bestsellers").toString().trim();
        const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 24;

        const response = await axios.get("https://openlibrary.org/search.json", {
            params: {
                q,
                limit
            }
        });

        const docs = Array.isArray(response.data.docs) ? response.data.docs : [];
        res.json({
            results: docs.map(mapOpenLibraryDoc),
            totalItems: response.data.numFound || docs.length
        });
    } catch (err) {
        console.error("Open Library search error:", err.message);
        res.status(500).json({
            message: "Unable to search books from Open Library."
        });
    }
});

module.exports = router;