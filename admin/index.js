const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser, checkAdmin } = require("../auth");

// app.use("/", checkAdmin, express.static(__dirname + "/public"));
app.use(
    "/",
    (req, res, next) => {
        if ((req.session.loggedIn && req.session.isAdmin) || req.path.startsWith("/api/votes")) next();
        else res.redirect("/");
    },
    express.static(__dirname + "/public"),
);

// For debugging ig
app.get("/api/all", checkAdmin, async (req, res) => {
    const all = [];

    const types = await db.query("SELECT * FROM types ORDER BY id");
    const clazz = await db.query("SELECT * FROM class ORDER BY id");
    const users = await db.query("SELECT * FROM users ORDER BY id");
    const quotes = await db.query("SELECT * FROM quotes ORDER BY id");
    const ranking_questions = await db.query("SELECT * FROM ranking_questions ORDER BY id");
    const ranking_answers = await db.query("SELECT * FROM ranking_answers ORDER BY id");
    const mottos = await db.query("SELECT * FROM mottos ORDER BY id");
    const motto_votes = await db.query("SELECT * FROM motto_votes ORDER BY id");

    all.push(
        { quotes },
        { clazz },
        { users },
        { quotes },
        { ranking_questions },
        { ranking_answers },
        { mottos },
        { motto_votes },
    );
    res.json(all);
});

app.get("/api/questions", checkAdmin, async (req, res) => {
    const questions = await db.query(
        "SELECT q.id, question, t.name type FROM ranking_questions q INNER JOIN types t on type_id = t.id ORDER BY q.id",
    );
    res.json(questions);
});

app.get("/api/answers", checkAdmin, async (req, res) => {
    const answers = await db.query(
        "SELECT question_id, u.name, u.middlename, u.surname, c.name class, count(*) count FROM ranking_questions q INNER JOIN ranking_answers a ON q.id = a.question_id INNER JOIN users u ON answer_id = u.id INNER JOIN class c ON u.class_id = c.id GROUP BY question_id, answer_id ORDER BY count DESC",
    );
    res.json(answers);
});

app.get("/api/votes", checkAdmin, async (req, res) => {
    const votes = await db.query(
        "SELECT m.id, m.name, m.description, SUM(votes) votes FROM motto_votes mv RIGHT JOIN mottos m on mv.motto_id = m.id GROUP BY m.id, m.name, m.description ORDER BY SUM(votes) DESC",
    );
    res.json(votes);
});

app.get("/api/participation", checkAdmin, async (req, res) => {
    const participation = await db.query(
        "SELECT c.name, CAST(COUNT(DISTINCT user_id) AS float) / CAST((SELECT COUNT(*) FROM users WHERE class_id = u.class_id) AS float) * 100 percentage FROM motto_votes INNER JOIN users u ON user_id = u.id INNER JOIN class c ON class_id = c.id GROUP BY class_id",
    );
    res.json(participation);
});

module.exports = app;
