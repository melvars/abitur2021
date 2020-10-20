const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const app = express.Router();

function checkUser(req, res, next) {
    if (req.session.loggedIn) next();
    else res.redirect("/auth");
}

function checkAdmin(req, res, next) {
    if (req.session.loggedIn && req.session.isAdmin) next();
    else if (req.session.loggedIn) return res.redirect("/");
    else return res.redirect("/auth");
}

app.use(
    "/",
    (req, res, next) => {
        // Very important, don't change :)
        if (!req.session.loggedIn || req.path.startsWith("/api") || /.*?\.[html|js|css]/.test(req.path)) next();
        else res.redirect("/");
    },
    express.static(__dirname + "/public"),
);

app.post("/api/login", async (req, res) => {
    if (req.session.loggedIn) return res.redirect("/");

    const { username, password } = req.body;
    if (!(username && password)) return res.redirect("/auth");
    const user = (await db.query("SELECT id, password, is_admin FROM users WHERE username = ?", [username]))[0];
    if (!user || !user.password) return res.redirect("/auth");
    const loggedIn = await bcrypt.compare(password, user.password);
    if (loggedIn) {
        console.log("LOGIN: " + user.id);
        req.session.loggedIn = true;
        req.session.isAdmin = user.is_admin;
        req.session.uid = user.id;
    }
    res.redirect("/auth");
});

app.use("/api/logout", checkUser, (req, res) => {
    console.log("LOGOUT: " + req.session.uid);
    req.session.destroy();
    res.redirect("/");
});

app.post("/api/password", checkUser, async (req, res) => {
    const { oldPassword, newPassword, newPasswordRep } = req.body;
    if (!oldPassword || !newPassword || !newPasswordRep || newPassword !== newPasswordRep || newPassword.length < 8)
        return res.send("error");
    const user = (await db.query("SELECT id, password FROM users WHERE id = ?", [req.session.uid]))[0];
    if (!user || !user.password) return res.send("error");
    if (!(await bcrypt.compare(oldPassword, user.password))) return res.send("error");
    try {
        console.log("PASSWORD CHANGE: " + user.id);
        const newHash = await bcrypt.hash(newPassword, 12);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, req.session.uid]);
        res.redirect("/");
    } catch (e) {
        console.error(e);
        res.send("error");
    }
});

app.get("/api/list", checkUser, async (req, res) => {
    let users;
    try {
        if (req.query.class === "all") {
            users = await db.query("SELECT id, name, middlename, surname, class_id FROM users ORDER BY class_id, name");
        } else if (req.query.class === "teacher") {
            users = await db.query(
                "SELECT id, name, middlename, surname, class_id FROM users WHERE type_id = 2 ORDER BY class_id, name",
            );
        } else {
            users = await db.query(
                "SELECT id, name, middlename, surname, class_id FROM users WHERE class_id = (SELECT class_id FROM users WHERE id = ?) AND id != ? ORDER BY name",
                [req.session.uid, req.session.uid],
            );
        }
    } catch (e) {
        console.error(e);
        return res.send("error");
    }

    res.json(users);
});

app.get("/api/status", (req, res) => {
    res.json({ loggedIn: req.session.loggedIn, admin: req.session.isAdmin });
});

module.exports = { auth: app, checkUser, checkAdmin };
