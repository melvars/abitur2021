const express = require("express");
const db = require("../db");
const fileupload = require("express-fileupload");
const app = express.Router();

app.use(fileupload({}));

app.use("/", express.static(__dirname + "/public/"));

app.get("/api/user/:uid", async (req, res) => {
    const uid = req.params.uid;
    const user = await db.query("SELECT name, middlename, surname FROM users WHERE id = ?", [uid]);
    const questions = await db.query(
        "SELECT q.id, q.question, t.type FROM profile_questions q INNER JOIN profile_input_types t ON t.id = q.question_type",
    );
    const answers = await db.query("SELECT answer, question_id FROM profile_answers WHERE user_id = ?", [uid]);

    for (const answer of answers) {
        const qid = questions.findIndex((question) => question.id === answer.question_id);
        if (qid !== undefined) questions[qid].answer = answer.answer;
    }
    res.json({ user: user[0], questions });
});

// Basic API
app.get("/api/questions", async (req, res) => {
    const questions = await db.query(
        "SELECT q.id, q.question, t.type FROM profile_questions q INNER JOIN profile_input_types t ON t.id = q.question_type",
    );
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
            if (!req.body.hasOwnProperty(qid) || req.body[qid] === "dbg-image") continue;
            let answer = req.body[qid].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            await db.query("INSERT INTO profile_answers (question_id, user_id, answer) VALUES (?, ?, ?)", [
                qid,
                req.session.uid,
                answer.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
            ]);
        }
        for (let fid in req.files) {
            if (!req.files.hasOwnProperty(fid)) return;

            let image, imageType, imageName;

            image = req.files[fid];
            imageType = image.name.split(".").reverse()[0];
            imageName = `${req.session.uid}_${new Date().getTime()}.${imageType}`;
            image.mv(__dirname + "/public/uploads/" + imageName);
            await db.query("INSERT INTO profile_answers (question_id, user_id, answer) VALUES (?, ?, ?)", [
                fid,
                req.session.uid,
                imageName,
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
            if (!req.body.hasOwnProperty(qid) || req.body[qid] === "dbg-image") continue;
            let answer = req.body[qid].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            await db.query("UPDATE profile_answers SET answer = ? WHERE question_id = ? AND user_id = ?", [
                answer,
                qid,
                req.session.uid,
            ]);
        }
        for (let fid in req.files) {
            if (!req.files.hasOwnProperty(fid)) return;

            let image, imageType, imageName;

            image = req.files[fid];
            imageType = image.name.split(".").reverse()[0];
            imageName = `${req.session.uid}_${new Date().getTime()}.${imageType}`;
            image.mv(__dirname + "/public/uploads/" + imageName);
            await db.query("UPDATE profile_answers SET answer = ? WHERE question_id = ? AND user_id = ?", [
                imageName,
                fid,
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
app.get("/api/comments/:uid", async (req, res) => {
    const uid = req.params.uid;
    const comments = await db.query(
        "SELECT *, (user_id = ? OR ?) AS owner FROM profile_comments WHERE profile_id = ?",
        [req.session.uid, req.session.isAdmin, uid],
    );
    res.json(comments);
});

app.post("/api/comment", async (req, res) => {
    const { pid, comment } = req.body;
    if (!pid || !comment) return res.json({ success: false });
    try {
        await db.query("INSERT INTO profile_comments (user_id, profile_id, comment) VALUES (?,?,?)", [
            req.session.uid,
            pid,
            comment,
        ]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }
});

app.put("/api/comment", async (req, res) => {
    const { pid, cid, comment } = req.body;
    if (!pid || !comment || !cid) return res.json({ success: false });
    try {
        await db.query("UPDATE profile_comments SET comment = ? WHERE user_id = ? AND profile_id = ? AND id = ?", [
            comment,
            req.session.uid,
            pid,
            cid,
        ]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }
});

app.delete("/api/comment", async (req, res) => {
    const { pid, cid } = req.body;
    if (!pid || !cid) return res.json({ success: false });
    try {
        await db.query("DELETE FROM profile_comments WHERE user_id = ? AND profile_id = ? AND id = ?", [
            req.session.uid,
            pid,
            cid,
        ]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }
});

module.exports = app;
