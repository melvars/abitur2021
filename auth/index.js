const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const app = express.Router();

// TODO: Change passwords
// TODO: Login (+ Frontend, cookie, etc)

app.use("/", express.static(__dirname + "/public"));

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!(username && password)) return res.send("error");
    const user = await db.query("SELECT id, password FROM users WHERE username = ?", [username]);
    if (!user.password) return res.send("error");
    const loggedIn = await bcrypt.compare(password, user.password);
    if (loggedIn) {
        req.session.loggedIn = true;
        req.session.uid = user.id;
    }
    return res.send(LoggedIn);
});

app.put("/api/password", async (req, res) => {
    const { pwd, newPwd } = req.body;
    if (!(pwd && newPwd)) return res.send("error");
    const user = await db.query("SELECT id, password FROM users WHERE username = ?", [username]);
    if (!user.password) return res.send("error");
    if (!((await bcrypt.compare(pwd, user.password)) && user.id === req.session.uid && req.session.loggedIn))
        return res.send("error");
    try {
        const newHash = await bcrypt.hash(newPwd, 12);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, req.session.uid]);
        res.send("ok");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.get("/api/list", (req, res) => {});

module.exports = app;
