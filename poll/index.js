const express = require("express");
const db = require("../db");
const app = express.Router();
const { checkUser } = require("../auth");

app.use("/", checkUser, express.static(__dirname + "/public"));

app.get("/api/question/:id", checkUser, async (req, res) => {
    try {
        const questions = await db.query(
            `SELECT rq.id, rq.question
             FROM ranking_questions rq
                      INNER JOIN types t on rq.type_id = t.id
             WHERE t.name = ?`,
            [req.query.type],
        );
        const id = req.params.id;
        if (id >= 0 && id < questions.length) {
            const question = questions[id];
            const answers = await db.query(
                `SELECT *
                 FROM ranking_answers
                 WHERE question_id = ?
                   AND user_id = ?`,
                [question.id, req.session.uid],
            );
            question.answer = answers.length > 0 ? answers[0].answer_id : undefined;
            res.json(question);
        } else {
            res.json({});
        }
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }
});

app.get("/api/questions/:type", checkUser, async (req, res) => {
    const type = req.params.type;
    const types = ["pupil", "teacher"];
    const fail = { success: false };
    if (types.includes(type)) {
        try {
            const questions = await db.query(
                `SELECT id
                 FROM ranking_questions rq
                 WHERE type_id = ?`,
                [types.indexOf(type) + 1],
            );
            const answers = await db.query(
                `SELECT question_id
                 FROM ranking_answers
                 WHERE user_id = ?`,
                [req.session.uid],
            );
            const resp = [];
            let i = 0;
            for (const question of questions) {
                const qid = answers.findIndex((answer) => question.id === answer.question_id);
                resp.push({ id: i++, answered: qid >= 0 });
            }
            res.json(resp);
        } catch (e) {
            console.error(e);
            res.json(fail);
        }
    } else res.json(fail);
});

app.post("/api/answer/:type", checkUser, async (req, res) => {
    return await answer(req, res, "INSERT INTO ranking_answers (answer_id, question_id, user_id) VALUE (?,?,?)");
});

app.put("/api/answer/:type", checkUser, async (req, res) => {
    return await answer(req, res, "UPDATE ranking_answers SET answer_id = ? WHERE question_id = ? AND user_id = ?");
});

async function answer(req, res, qu) {
    const type = req.params.type;
    const types = ["pupil", "teacher"];
    const fail = { success: false };
    if (types.includes(type)) {
        const { question, answer } = req.body;
        if (+answer === +req.session.uid || !question || !answer) return res.json(fail);
        try {
            const answerTypes = await db.query("SELECT type_id FROM ranking_questions WHERE id = ?", [question]);
            if (!answerTypes.length > 0) return res.json(fail);
            if (type !== types[answerTypes[0].type_id - 1]) return res.json(fail);
            if (type === types[0]) {
                const userClass = (await db.query("SELECT class_id FROM users WHERE id = ?", [req.session.uid]))[0]
                    .class_id;
                const answerUsers = await db.query("SELECT class_id FROM users WHERE id = ?", [answer]);
                if (!answerUsers.length > 0 || userClass !== answerUsers[0].class_id) return res.json(fail);
            } else if (type !== types[1]) return res.json(fail);
            await db.query(qu, [answer, question, req.session.uid]);
            res.json({ success: true });
        } catch (e) {
            console.error(e);
            res.json(fail);
        }
    } else res.json(fail);
}

module.exports = app;
