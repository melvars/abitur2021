const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser } = require("../auth");

app.use("/", checkUser, express.static(__dirname + "/public"));

app.post("/api/add", checkUser, async (req, res) => {
    if (!req.body.secret) return res.send("error");
    try {
        await db.query("INSERT INTO secrets (user_id, secret) VALUE (?,?)", [
            req.session.uid,
            req.body.secret.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
        ]);
        res.redirect("/secrets");
    } catch (e) {
        console.error(e);
        res.json("error");
    }
});

app.get("/api/list", checkUser, async (req, res) => {
    const secrets = await db.query(
        "SELECT s.id, s.secret, c.name class, (s.user_id = ? OR ?) AS owner FROM secrets s INNER JOIN users u ON u.id = s.user_id INNER JOIN class c ON c.id = u.class_id",
        [req.session.uid, req.session.isSuperAdmin || false],
    );
    res.json(secrets);
});

app.delete("/api/delete/:id", checkUser, async (req, res) => {
    if (!req.params.id) return res.send("error");
    try {
        await db.query("DELETE FROM secrets WHERE id = ? AND (user_id = ? OR ?)", [
            req.params.id,
            req.session.uid,
            req.session.isSuperAdmin || false,
        ]);
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

module.exports = app;
