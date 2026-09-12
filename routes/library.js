const express = require('express');
const router = express.Router();
const axios = require('axios');

function mapOpenLibraryDoc(doc) {
    const coverId = doc.cover_i;
    return {
        id: doc.key || `${doc.title || "book"}-${doc.first_publish_year || "unknown"}`,
        title: doc.title || "Untitled",
        authors: Array.isArray(doc.author_name) ? doc.author_name : [],
        thumbnail: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "",
        published: doc.first_publish_year ? String(doc.first_publish_year) : "",
    };
}

// The library page always asks OpenLibrary for the same three canned
// queries, so a fresh network round trip on every page load just adds
// latency for no benefit — cache each query's results in memory for a
// few minutes.
const CACHE_TTL_MS = 10 * 60 * 1000;
const bookCache = new Map(); // query -> { data, expiresAt }

async function fetchBookData(query) {
    const cached = bookCache.get(query);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    try {
        const response = await axios.get("https://openlibrary.org/search.json", {
            params: { q: query, limit: 12 },
            timeout: 10000
        });
        const docs = Array.isArray(response.data.docs) ? response.data.docs : [];
        const books = docs.map(mapOpenLibraryDoc);
        bookCache.set(query, {data: books, expiresAt: Date.now() + CACHE_TTL_MS});
        return books;
    } catch (error) {
        console.error(`Error fetching books for query "${query}":`, error.message);
        // Serve stale cached data rather than an empty shelf if OpenLibrary
        // is slow/unreachable but we have a previous successful result.
        return cached ? cached.data : [];
    }

    // at the bottom of routes/library.js, after fetchBookData is defined
async function warmCache() {
    await Promise.all([
        fetchBookData('trending now'),
        fetchBookData('classic literature'),
        fetchBookData('software development')
    ]);
    console.log('Library cache warmed');
}
warmCache();
setInterval(warmCache, CACHE_TTL_MS - 30_000); // refresh just before expiry
}

router.get('/projects/library', async (req, res) => {
    try {
        const [trendingBooks, classicBooks, techBooks] = await Promise.all([
            fetchBookData('trending now'),
            fetchBookData('classic literature'),
            fetchBookData('software development')
        ]);

        res.render('projects/library/library', {
            trendingBooks,
            classicBooks,
            techBooks,
            error: null
        });
    } catch (error) {
        console.error("Error rendering library page:", error.message);
        res.status(500).render('projects/library/library', {
            trendingBooks: [],
            classicBooks: [],
            techBooks: [],
            error: 'Could not load the book library. Please try again later.'
        });
    }
});

module.exports = router;
