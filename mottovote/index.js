const express = require("express");
const db = require("../db");
const { checkUser } = require("../auth");
const app = express.Router();


app.use("/", express.static(__dirname + "/public/"));

app.get("/api/list", async (req, res) => {
    const mottos = await db.query("SELECT id, name, description FROM motto_votes ORDER BY name, description");
    res.json(mottos);
});

app.put("/api/vote", async (req, res) => {
    for (const mid in req.body) {
        await db.query("UPDATE motto_votes SET votes = votes + ? WHERE id = ?", [req.body[mid], mid]);
    }
    res.send("ok");
});

module.exports = app;