const express = require("express");
const db = require("../db");
const app = express.Router();

// TODO: Name list parser (teachers + pupils)
// TODO: Add users (OTP)
// TODO: Change passwords
// TODO: Login (+ Frontend, cookie, etc)

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", (req, res) => {});

module.exports = app;
