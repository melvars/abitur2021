const express = require("express");
const db = require("../db");
const app = express.Router();

app.use("/", express.static(__dirname + "/public/"));

app.get("/user/:uid", async (req, res) => {});

// Basic API
app.get("/api/user", async (req, res) => {
    const user = (await db.query("SELECT name, surname FROM users WHERE id = ?", [req.session.uid]))[0];
    res.json(user);
});

app.get("/api/questions", async (req, res) => {
    const questions = await db.query("SELECT id, question FROM profile_questions");
    const answers = await db.query("SELECT answer, question_id FROM profile_answers WHERE user_id = ?", [
        req.session.uid,
    ]);

    for (const answer of answers) {
        const qid = questions.findIndex((question) => question.id === answer.question_id);
        if (qid !== undefined) questions[qid].answer = answer.answer;
    }
    res.json(questions);
});

app.post("/api/add", async (req, res) => {
    try {
        for (let qid in req.body) {
            if (!req.body.hasOwnProperty(qid)) continue;
            await db.query("INSERT INTO profile_answers (question_id, user_id, answer) VALUES (?, ?, ?)", [
                qid,
                req.session.uid,
                req.body[qid].replace(/</g, "&lt;").replace(/>/g, "&gt;"),
            ]);
        }
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.put("/api/update", async (req, res) => {
    try {
        for (let qid in req.body) {
            if (!req.body.hasOwnProperty(qid)) continue;
            await db.query("UPDATE profile_answers SET answer = ? WHERE question_id = ? AND user_id = ?", [
                req.body[qid].replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                qid,
                req.session.uid,
            ]);
        }
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

// Comments API
app.get("/api/comments/:uid", async (req, res) => {});

app.post("/api/comment", async (req, res) => {});

app.put("/api/comment", async (req, res) => {});

app.delete("/api/comment", async (req, res) => {});

module.exports = app;
