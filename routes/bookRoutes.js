const express = require("express");
const router = express.Router();
const bookModel = require("../models/bookModel");

router.get("/books-data", async (req, res) => {
    try {
        const books = await bookModel.getAllBooks();
        const authors = await bookModel.getBookAuthors();

        const formattedBooks = books.map((book) => {
            const bookAuthors = authors
                .filter((a) => String(a.BookID) === String(book.BookID))
                .map((a) => `${a.FirstName} ${a.LastName}`)
                .join(", ");

            return {
                id: String(book.BookID),
                title: book.BookName || "Untitled",
                authors: bookAuthors || "Unknown author",
                genre: book.GenreName || "Uncategorized",
                publishedDate: "N/A",
                pageCount: book.PagesNumber || "Unknown",
                rating: 0,
                thumbnail: "https://placehold.co/256x384?text=No+Cover",
                description: "No description available.",
                infoLink: "#"
            };
        });

        res.json({books: formattedBooks});
    } catch (error) {
        console.error("books-data route error:", error);
        res.status(500).json({
            error: "Failed to load books data",
            details: error.message
        });
    }
});

module.exports = router;