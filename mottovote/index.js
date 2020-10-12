const express = require("express");
const db = require("../db");
const { checkUser } = require("../auth");
const app = express.Router();

app.use("/", checkUser, express.static(__dirname + "/public/"));

app.get("/api/list", checkUser, async (req, res) => {
    const mottos = await db.query("SELECT id, name, description FROM mottos ORDER BY name, description");
    const votes = await db.query("SELECT motto_id, votes FROM motto_votes WHERE user_id = ?", [req.session.uid]);

    for (const vote of votes) {
        const mid = mottos.findIndex((motto) => motto.id === vote.motto_id);
        if (mid !== undefined) mottos[mid].votes = vote.votes;
    }
    res.json(mottos);
});

app.put("/api/vote", checkUser, async (req, res) => {
    await db.query("DELETE FROM motto_votes WHERE user_id = ?", [req.session.uid]);
    try {
        if (Object.keys(req.body).length > 3) return res.send("error");
        for (const mid in req.body) {
            await db.query("INSERT INTO motto_votes (user_id, motto_id, votes) VALUES (?, ?, ?)", [
                req.session.uid,
                mid,
                req.body[mid],
            ]);
        }
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

module.exports = app;
