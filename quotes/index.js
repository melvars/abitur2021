const express = require("express");
const db = require("../db");
const app = express.Router();

app.use("/", express.static(__dirname + "/public"));

app.post("/api/add", async (req, res) => {
    if (!req.body.author || !req.body.quote) return res.send("error");
    try {
        await db.query("INSERT INTO quotes (user_id, author_id, quote) VALUE (?,?,?)", [
            72, // TODO: Add actual user identification
            parseInt(req.body.author),
            req.body.quote,
        ]);
        res.redirect("/quotes");
    } catch (e) {
        console.error(e);
        res.json("error");
    }
});

app.get("/api/list", async (req, res) => {
    const quotes = await db.query(
        "SELECT quotes.id, name, middlename, surname, quote FROM quotes INNER JOIN users AS a ON author_id = a.id ORDER BY name"
    );
    res.json(quotes);
});

module.exports = app;
