const express = require("express");
const db = require("../db");
const app = express.Router();

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", (req, res) => {
    res.send("ok\n");
});

module.exports = app;
