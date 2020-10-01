const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const app = express.Router();

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Access overflow!",
});

//const fs = require("fs");
//app.get("/sync", (req, res) => {
//    fs.readFile(__dirname + "/list.txt", "utf8", (err, data) => {
//        if (err) {
//            console.error(err);
//            return res.send("error");
//        }
//        const lines = data.split("\n");
//        lines.forEach(async (line) => {
//            const split = line.split(" - ");
//            try {
//                if (split.length >= 2)
//                    await db.query("INSERT INTO theme (main, description) VALUES (?, ?)", split.slice(0, 2));
//                else console.log(line);
//            } catch (e) {
//                console.error(e);
//            }
//        });
//	res.send("ok");
//    });
//});

app.use("/", express.static(__dirname + "/public"));

app.use("/api/", apiLimiter);

app.get("/api/list", async (req, res) => {
    try {
        const themes = await db.query("SELECT * FROM theme WHERE hidden = FALSE ORDER BY votes DESC");
        res.json(themes);
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.post("/api/add", async (req, res) => {
    console.log(req.body.main, req.body.description);
    if (!req.body.main || !req.body.description) return res.send("error");
    try {
        await db.query("INSERT INTO theme (main, description) VALUES (?, ?)", [req.body.main, req.body.description]);
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.post("/api/vote", async (req, res) => {
    console.log(req.body.id, req.body.vote);
    if (req.body.vote < -1 || req.body.vote > 1) {
        res.send("error");
        return;
    }

    try {
        await db.query("UPDATE theme SET votes = votes + ? WHERE id = ?", [req.body.vote, req.body.id]);
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

module.exports = app;
