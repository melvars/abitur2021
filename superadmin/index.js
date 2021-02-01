const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkSuperAdmin } = require("../auth");
const { exec } = require("child_process");

app.use("/", checkSuperAdmin, express.static(__dirname + "/public"))

app.post("/api/query", checkSuperAdmin, async (req, res) => {
    const { query } = req.body;
    let s;
    const lc = query.toLowerCase();
    if (!query || !(lc.startsWith("select") || lc.startsWith("delete from") || lc.startsWith("update") || lc.startsWith("insert into")) || (s = query.split(";")).length > 1 && s[1] !== "")
        return res.status(403).json({ success: false });
    try {
        const response = await db.query(query);
        res.json({ success: true, response });
    } catch (e) {
        res.json({ success: false, message: e });
    }
});

app.get("/api/pull", checkSuperAdmin, (req, res) => {
    exec("git pull", (error, stdout, stderr) => {
        if (stderr) return res.json({ success: false, stderr, error });
        return res.json({ success: true, stdout });
    });
});

app.post("/api/reset", checkSuperAdmin, async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.json({ success: false });
    try {
        const pwd = await db.regenerateUser(uid);
        return res.json({ success: true, uid, pwd });
    } catch (e) {
        console.error(e);
        return res.json({ success: false, e });
    }
});

module.exports = app;