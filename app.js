require("dotenv").config();
const express = require("express");
const session = require("express-session");

const { auth, checkUser } = require("./auth");
const motto = require("./motto");
const quotes = require("./quotes");

const app = express();

// TODO: Use secure: true in production
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: true, cookie: { secure: false } }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", checkUser, (req, res) => res.redirect("/motto"));
app.use("/motto", checkUser, motto);
app.use("/quotes", checkUser, quotes);
app.use("/auth", auth);

app.listen(5005, () => console.log("Server started on http://localhost:5005"));
