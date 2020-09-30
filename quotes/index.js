require("dotenv").config();
const express = require("express");
const mariadb = require("mariadb");
const app = express();
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
});

let db_conn;

pool.getConnection()
    .then((conn) => {
        db_conn = conn;
        db_conn.release();
    })
    .catch((err) => {
        console.error(err);
        db_conn = null;
    });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", (req, res) => {
    res.send("ok\n");
});

app.on("close", () => {
    console.log("CLOSE");
});

console.log("Listening on port 5007");
app.listen(5007);
