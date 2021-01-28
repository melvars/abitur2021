const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser } = require("../auth");

app.use("/", checkUser, express.static(__dirname + "/public"));

app.get("/api/get", checkUser, async (req, res) => {
    try {
        const answer = (await db.query("SELECT * FROM teacher_prediction WHERE user_id = ?", [req.session.uid]))[0] || {};
        // console.log(answer);
        res.json(answer);
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }
});

app.post("/api/set", checkUser, async (req, res) => {
    const { teacher } = req.body;
    if (!teacher) return res.json({ success: false });
    try {
        const isTeacher = (await db.query("SELECT id FROM users WHERE type_id = 2 AND id = ?", [teacher])).length > 0;
        if (!isTeacher) return res.json({ success: false });
        await db.query("INSERT INTO teacher_prediction (user_id, teacher_id) VALUE (?,?)", [req.session.uid, teacher]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }
});

app.put("/api/set", checkUser, async (req, res) => {
    const { teacher } = req.body;
    if (!teacher) return res.json({ success: false });
    try {
        const isTeacher = (await db.query("SELECT id FROM users WHERE type_id = 2 AND id = ?", [teacher])).length > 0;
        if (!isTeacher) return res.json({ success: false });
        await db.query("UPDATE teacher_prediction SET teacher_id = ? WHERE user_id = ?", [+teacher, req.session.uid]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }
});

module.exports = app;
