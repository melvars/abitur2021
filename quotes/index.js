const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser } = require("../auth");

app.use("/", checkUser, express.static(__dirname + "/public"));

app.post("/api/add", checkUser, async (req, res) => {
    if (!req.body.author || !req.body.quote) return res.send("error");
    try {
        await db.query("INSERT INTO quotes (user_id, author_id, quote) VALUE (?,?,?)", [
            req.session.uid,
            parseInt(req.body.author),
            req.body.quote.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
        ]);
        res.redirect("/quotes");
    } catch (e) {
        console.error(e);
        res.json("error");
    }
});

app.get("/api/list", checkUser, async (req, res) => {
    const quotes = await db.query(
        "SELECT q.id, a.name, a.middlename, a.surname, q.quote, c.name AS class, (q.user_id = ? OR ?) AS owner FROM quotes AS q INNER JOIN users AS a ON author_id = a.id INNER JOIN class AS c ON a.class_id = c.id ORDER BY a.name",
        [req.session.uid, req.session.isAdmin],
    );
    res.json(quotes);
});

app.delete("/api/delete/:id", checkUser, async (req, res) => {
    if (!req.params.id) return res.send("error");
    try {
        await db.query("DELETE FROM quotes WHERE id = ? AND (user_id = ? OR ?)", [req.params.id, req.session.uid, req.session.isAdmin]);
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

module.exports = app;
