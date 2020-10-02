require("dotenv").config();
const express = require("express");
const session = require("express-session");

const { auth, checkUser } = require("./auth");
const motto = require("./motto");
const quotes = require("./quotes");

const app = express();

// TODO: Use secure: true in production
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(__dirname + "/overview/public"));
app.use("/motto", checkUser, motto);
app.use("/quotes", checkUser, quotes);
app.use("/auth", auth);

app.listen(5005, () => console.log("Server started on http://localhost:5005"));
