const ADODB = require("node-adodb");
const path = require("path");

// 🔁 CHANGE THIS to your actual DB file name/location
const dbPath = path.join(__dirname, "../database/library.accdb");

const connection = ADODB.open(
    `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${dbPath};Persist Security Info=False;`
);

module.exports = connection;