require("dotenv").config();
const express = require("express");
const session = require("express-session");

const motto = require("./motto");
const auth = require("./auth");
const quotes = require("./quotes");

const app = express();

// TODO: Use secure: true in production
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: true, cookie: { secure: false } }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.redirect("/motto"));
app.use("/motto", motto);
app.use("/auth", auth);
app.use("/quotes", quotes);

app.listen(5005, () => console.log("Server started on http://localhost:5005"));
