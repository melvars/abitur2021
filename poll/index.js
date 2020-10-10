const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser } = require("../auth");

app.use("/", checkUser, express.static(__dirname + "/public"));

app.post("/api/answer", checkUser, async (req, res) => {
    if (!req.body.answer || !req.body.question || !req.query.type) return res.send("error");
    if (req.body.answer == req.session.uid) return res.send("error");
    try {
        if (req.query.type == "pupil") {
            const user_class = (await db.query("SELECT class_id FROM users WHERE id = ?", [req.session.uid]))[0]
                .class_id;
            const answer_class = (
                await db.query("SELECT class_id FROM users WHERE id = ?", [parseInt(req.body.answer)])
            )[0].class_id;
            if (user_class != answer_class) return res.send("error");
        } else if (req.query.type == "teacher") {
            const answer_type = (
                await db.query(
                    "SELECT t.name FROM users AS u INNER JOIN types AS t ON u.type_id = t.id WHERE u.id = ?",
                    [parseInt(req.body.answer)],
                )
            )[0].name;
            if (answer_type != "teacher") return res.send("error");
        } else {
            return res.send("error");
        }

        await db.query("INSERT INTO ranking_answers (question_id, user_id, answer_id) VALUE (?,?,?)", [
            parseInt(req.body.question),
            req.session.uid,
            parseInt(req.body.answer),
        ]);
        res.redirect("/poll?type=" + req.query.type);
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.get("/api/get", checkUser, async (req, res) => {
    try {
        const question = (
            await db.query(
                "SELECT q.id, q.question, t.name FROM ranking_questions AS q INNER JOIN types AS t ON type_id = t.id WHERE q.id NOT IN (SELECT question_id FROM ranking_answers WHERE user_id = ?) AND t.name = ? LIMIT 1",
                [req.session.uid, req.query.type],
            )
        )[0];
        res.json(question);
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

module.exports = app;
