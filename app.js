require("dotenv").config();
require("./db").init();
const express = require("express");
const session = require("express-session");
const fs = require("fs").promises;
require("log-timestamp");

const { auth, checkUser, checkAdmin } = require("./auth");
const mottovote = require("./mottovote");
const quotes = require("./quotes");
const poll = require("./poll");
const profile = require("./profile");
const admin = require("./admin");
const questions = require("./questions");
const prediction = require("./prediction");
const secrets = require("./secrets");

const app = express();

// TODO: Use secure: true in production
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();
const ttl = 15778800000; // 6 Months
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, expires: new Date(Date.now() + ttl), maxAge: ttl },
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(__dirname + "/overview/public"));
app.use("/mottovote", checkUser, mottovote);
app.use("/quotes", checkUser, quotes);
app.use("/poll", checkUser, poll);
app.use("/profile", checkUser, profile);
app.use("/questions", checkUser, questions);
app.use("/prediction", checkUser, prediction);
app.use("/secrets", checkUser, secrets);
app.use("/admin", checkAdmin, admin); // Lel
app.use("/auth", auth);

app.get("/images", checkUser, async (req, res) => {
    const links = (await fs.readFile(__dirname + "/images.txt", "utf8")).split("\n");
    res.redirect(links[req.session.cid - 1]);
});

app.listen(process.env.PORT || 5005, () => console.log(`Server started on http://localhost:${process.env.PORT}`));
