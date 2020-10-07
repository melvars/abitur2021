const express = require("express");
const db = require("../db");
const app = express.Router();

app.use("/", express.static(__dirname + "/public/"));

// Basic API
app.get("/api/user", async (req, res) => {});

app.get("/api/questions", async (req, res) => {
    const questions = await db.query("SELECT id, question FROM profile_questions");
    const answers = await db.query("SELECT answer, question_id FROM profile_answers WHERE user_id = ?", [req.session.uid]);

    for (const answer of answers) {
        const qid = questions.findIndex((question) => question.id === answer.question_id);
        if (qid !== undefined) questions[qid].answer = answer.answer;
    }
    res.json(questions);
});

app.post("/api/add", async (req, res) => {});

app.put("/api/update", async (req, res) => {});

// Comments API
app.get("/api/comments/:uid", async (req, res) => {});

app.post("/api/comment", async (req, res) => {});

app.put("/api/comment", async (req, res) => {});

app.delete("/api/comment", async (req, res) => {});

module.exports = app;