// routes/api.js
"use strict";

const express = require("express");
const axios = require("axios");

const router = express.Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

// Check the key at request time (no throwing during import)
router.use((req, res, next) => {
    const key = process.env.TMDB_API_KEY;
    if (!key) {
        return res.status(500).json({
            error: "TMDB_API_KEY is missing. Add it to your .env or host env."
        });
    }
    req.tmdbKey = key;
    next();
});

// Helper to fetch with retry for stability against rate limits (429) or transient 5xx errors
async function fetchFromTMDB(url, params, retries = 3) {
    try {
        return await axios.get(url, {params, timeout: 10000});
    } catch (err) {
        const status = err.response ? err.response.status : null;
        // Retry on Too Many Requests or Server Errors
        if (retries > 0 && (status === 429 || (status >= 500 && status < 600) || !status)) {
            console.warn(`[TMDB] Error ${status || 'Network'}. Retrying... (${retries} left)`);
            await new Promise(r => setTimeout(r, 1000)); // wait 1 second
            return fetchFromTMDB(url, params, retries - 1);
        }
        throw err; // Out of retries or non-retryable error (e.g., 401, 404)
    }
}

function isV4Token(s) {
    // TMDB v4 tokens are JWTs that typically start with "eyJ"
    return typeof s === "string" && s.startsWith("eyJ");
}

router.get("/details/:type/:id", async (req, res) => {
    try {
        const {data} = await fetchFromTMDB(`${TMDB_BASE}/${req.params.type}/${req.params.id}`, withKey(req));
        res.json(normalize(data, req.params.type)); // or send full data
    } catch (err) {
        res.status(err?.response?.status || 500).json({error: "Failed to fetch details"});
    }
});

// Helper to attach the key
function withKey(req, params = {}) {
    return {api_key: req.tmdbKey, language: "en-US", ...params};
}

// Safe normalizer (won’t crash on partial TMDB data)
function normalize(item, type) {
    const title = type === "movie" ? item?.title : item?.name;
    const date = type === "movie" ? item?.release_date : item?.first_air_date;
    return {
        id: item?.id,
        type,
        title: title || "(untitled)",
        year: (date || "").slice(0, 4),
        release_date: date,
        rating: typeof item?.vote_average === "number" ? item.vote_average : null,
        poster: item?.poster_path ? `${IMG_BASE}${item.poster_path}` : "",
        backdrop: item?.backdrop_path ? `${BACKDROP_BASE}${item.backdrop_path}` : null,
        overview: item?.overview || "",
        genre_ids: Array.isArray(item?.genre_ids) ? item.genre_ids : [],
        isAdult: item?.adult,
    };
}

// ---- Routes ----

// GET /api/genres?type=movie|tv
router.get("/genres", async (req, res) => {
    try {
        const type = req.query.type === "tv" ? "tv" : "movie";
        const {data} = await fetchFromTMDB(`${TMDB_BASE}/genre/${type}/list`, withKey(req));
        res.json(data.genres || []);
    } catch (err) {
        const status = err?.response?.status || 502;
        console.error("[GET /api/genres] TMDB error:", status, err?.message);
        res.status(status).json({error: "Upstream TMDB request failed", status});
    }
});

// GET /api/list?type=movie|tv&sort=popular|top_rated|now_playing|upcoming|airing_today|on_the_air
router.get("/list", async (req, res) => {
    try {
        const type = req.query.type === "tv" ? "tv" : "movie";
        const sort = String(req.query.sort || "popular");
        const valid = new Set([
            "popular", "top_rated", "now_playing", "upcoming", "airing_today", "on_the_air"
        ]);
        const pathSort = valid.has(sort) ? sort : "popular";
        const {data} = await fetchFromTMDB(`${TMDB_BASE}/${type}/${pathSort}`, withKey(req));
        res.json((data.results || []).map(i => normalize(i, type)));
    } catch (err) {
        const status = err?.response?.status || 502;
        console.error("[GET /api/list] TMDB error:", status, err?.message);
        res.status(status).json({error: "Upstream TMDB request failed", status});
    }
});

// GET /api/discover?type=movie|tv&with_genres=28,12
router.get("/discover", async (req, res) => {
    try {
        const type = req.query.type === "tv" ? "tv" : "movie";
        const params = {
            with_genres: req.query.with_genres || undefined,
            sort_by: req.query.sort_by || undefined,
            include_adult: false,
            page: req.query.page || 1,
        };
        const {data} = await fetchFromTMDB(`${TMDB_BASE}/discover/${type}`, withKey(req, params));
        res.json((data.results || []).map(i => normalize(i, type)));
    } catch (err) {
        const status = err?.response?.status || 502;
        console.error("[GET /api/discover] TMDB error:", status, err?.message);
        res.status(status).json({error: "Upstream TMDB request failed", status});
    }
});

// GET /api/search?q=batman
router.get("/search", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({error: "Missing query parameter 'q'"});

    try {
        const [movies, tv] = await Promise.all([
            fetchFromTMDB(`${TMDB_BASE}/search/movie`, withKey(req, {query: q, include_adult: false, page: 1})),
            fetchFromTMDB(`${TMDB_BASE}/search/tv`, withKey(req, {query: q, page: 1})),
        ]);
        const out = [
            ...(movies.data.results || []).map(i => normalize(i, "movie")),
            ...(tv.data.results || []).map(i => normalize(i, "tv")),
        ];
        res.json(out);
    } catch (err) {
        const status = err?.response?.status || 502;
        console.error("[GET /api/search] TMDB error:", status, err?.message);
        res.status(status).json({error: "Upstream TMDB request failed", status});
    }
});

module.exports = router;