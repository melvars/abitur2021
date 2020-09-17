const express = require("express");
const sqlite3 = require("sqlite3");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let db;
function create_db() {
    if (db) db.close();

    db = new sqlite3.Database("db.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.error(err.message);
        console.log("Connected to the database");
    });

    db.run(
        "CREATE TABLE IF NOT EXISTS theme(id INTEGER PRIMARY KEY AUTOINCREMENT, main TEXT NOT NULL, description TEXT NOT NULL, votes INTEGER DEFAULT 0, UNIQUE(main, description))",
        (err) => {
            if (err) console.error(err.message);
        }
    );
}

function insert(main, description, votes) {
    db.run(`INSERT INTO theme(main, description, votes) VALUES(?, ?, ?)`, [main, description, votes], (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
    });
}

// app.get("/sync", (req, res) => {
//     fs.unlinkSync("db.db");
//     fs.closeSync(fs.openSync("db.db", "w"));
//     create_db();
//     fs.readFile("list.txt", "utf8", (err, data) => {
//         if (err) return;
//         const lines = data.split("\n");
//         lines.forEach((line) => {
//             const split = line.split(" - ");
//             if (split[0] && split[1]) insert(split[0], split[1], 0);
//             else console.log(line);
//         });
//     });
//     res.send("ok");
// });

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", (req, res) => {
    db.all("SELECT * FROM theme ORDER BY votes DESC", (err, all) => {
        if (err) {
            res.send("error");
            console.error(err.message);
            return;
        }
        res.send(all);
    });
});

app.post("/api/add", (req, res) => {
    console.log(req.body.main, req.body.description);
    if (!req.body.main || !req.body.description) res.send("error");
    insert(req.body.main, req.body.description, 1);
    res.send("ok");
});

app.post("/api/vote", (req, res) => {
    console.log(req.body.id, req.body.vote);
    if (req.body.vote < -1 || req.body.vote > 1) res.send("error");

    db.all("UPDATE theme SET votes = votes + ? WHERE id = ?", [req.body.vote, req.body.id], (err) => {
        if (err) {
            res.send("error");
            console.error(err.message);
            return;
        }
    });
    res.send("ok");
});

app.on("close", () => {
    console.log("CLOSE");
    db.close();
});

create_db();
console.log("Listening on port 3000");
app.listen(3000);
