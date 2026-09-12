require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = app.get("views");

// --- Main Routes ---
const openLibraryApiRouter = require('./routes/openlibraryapi');
const libraryRouter = require('./routes/library');

// Specific routes MUST be mounted before generic/dynamic routes.
app.use("/", libraryRouter);
app.use("/", openLibraryApiRouter);
app.use("/api", require("./routes/api"));
// app.use("/",    require("./routes/bookRoutes"));

// Generic page router is mounted LAST.
app.use("/",    require("./routes/pages"));


// --- Health check & Error Handling ---

app.get("/healthz", (req, res) => {
    res.json({
        ok: true,
        tmdbKeyPresent: !!process.env.TMDB_API_KEY,
        nodeEnv: process.env.NODE_ENV || "development",
    });
});

// 404 — must be after all routes
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Global error handler — must be last and have 4 params
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));