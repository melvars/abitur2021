require("dotenv").config();
const express = require("express");
const session = require("express-session");

const motto = require("./motto");
const auth = require("./auth");
const quotes = require("./quotes");

const app = express();

app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: true, cookie: { secure: true } }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.redirect("/motto"));
app.use("/motto", motto);
app.use("/auth", auth);
app.use("/quotes", quotes);

app.listen(5005, () => console.log("Server started on http://localhost:5005"));
