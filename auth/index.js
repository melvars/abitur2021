const express = require("express");
const db = require("../db");
const app = express.Router();

// TODO: Name list parser (teachers + pupils)
// TODO: Add users (OTP)
// TODO: Change passwords
// TODO: Login (+ Frontend, cookie, etc)

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", async (req, res) => {
    const users = await db.query("SELECT id, name, middlename, surname FROM users");
    res.json(users);
});

module.exports = app;
