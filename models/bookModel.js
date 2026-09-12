const db = require("./db");

async function getAllBooks() {
    const sql = `
        SELECT b.BookID,
               b.BookName,
               b.PagesNumber,
               g.GenreName
        FROM tblBooks AS b
                 LEFT JOIN tblBookGenre AS g
                           ON b.BookGenreID = g.BookGenreID
        ORDER BY b.BookName
    `;

    return db.query(sql);
}

async function getBookAuthors() {
    const sql = `
        SELECT ba.BookID,
               a.FirstName,
               a.LastName
        FROM tblBookAuthor AS ba
                 INNER JOIN tblAuthor AS a
                            ON ba.AuthorID = a.AuthorID
    `;

    return db.query(sql);
}

module.exports = {
    getAllBooks,
    getBookAuthors,
};