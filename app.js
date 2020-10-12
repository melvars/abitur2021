require("dotenv").config();
require("./db").init();
const express = require("express");
const session = require("express-session");

const { auth, checkUser, checkAdmin } = require("./auth");
const mottovote = require("./mottovote");
const quotes = require("./quotes");
const poll = require("./poll");
const profile = require("./profile");
const admin = require("./admin");

const app = express();

// TODO: Use secure: true in production
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(__dirname + "/overview/public"));
app.use("/mottovote", checkUser, mottovote);
app.use("/quotes", checkUser, quotes);
// app.use("/poll", checkUser, poll);
// app.use("/profile", checkUser, profile);
app.use("/admin", checkAdmin, admin);
app.use("/auth", auth);

app.listen(process.env.PORT || 5005, () => console.log("Server started on http://localhost:5005"));
