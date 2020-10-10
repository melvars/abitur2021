const mariadb = require("mariadb");
const bcrypt = require("bcrypt");
const nanoid = require("nanoid");
const fs = require("fs");

class DB {
    constructor() {
        this.pool = mariadb.createPool({
            host: process.env.DBHost,
            user: process.env.DBUser,
            password: process.env.DBPassword,
            database: process.env.DBName,
        });
        this.init();
    }

    connect() {
        return this.pool.getConnection();
    }

    init() {
        fs.readFile(__dirname + "/tables.sql", "utf8", async (err, data) => {
            if (err) throw err;
            const queries = data.split(";");
            queries.pop();
            for (const query of queries) await this.query(query);
            console.log("Tables created!");

            const res = await this.query("SELECT * FROM users");
            if (res.length === 0) this.initValues();
        });
    }

    initValues() {
        fs.readFile(__dirname + "/names.csv", "utf8", async (err, data) => {
            if (err) throw err;

            await this.query("INSERT INTO types (name) VALUES ('pupil'), ('teacher')");
            await this.query(
                "INSERT INTO class (name) VALUES ('TGM13.1'), ('TGM13.2'), ('TGTM13.1'), ('TGI13.1'), ('TGI13.2'), ('teacher')",
            );

            fs.readFile(__dirname + "/poll.txt", "utf8", (err, data) => {
                if (err) throw err;

                const parts = data.split("--");
                parts.forEach((part, i) => {
                    const questions = part.split("\n");
                    questions.forEach((question) => {
                        if (question.length > 0)
                            this.query("INSERT INTO ranking_questions (question, type_id) VALUE (?,?)", [
                                question,
                                i + 1,
                            ]);
                    });
                });
            });

            fs.readFile(__dirname + "/mottos.txt", "utf8", (err, data) => {
                if (err) throw err;

                const mottos = data.split("\n");
                mottos.forEach(async (motto) => {
                    const [name, desc] = motto.split(" - ");
                    if (motto) await this.query("INSERT INTO mottos (name, description) VALUES (?, ?)", [name, desc]);
                });
            });

            const classes = data.split("--");
            const userPasswords = {};
            console.log("Generating users");
            for (const [classIndex, clazz] of classes.entries()) {
                const students = clazz.split("\n");
                userPasswords[classIndex] = [];
                // students.forEach(async (student) => {
                for (const student of students) {
                    // console.log(".");
                    // Fix undefined
                    if (student && student.length > 3) {
                        const [_, surname, name] = student.split(",");
                        const names = name.split(" ");
                        const middlename = names.length > 1 && names[1] ? names.slice(1).join(" ") : null;
                        let username = surname.toLowerCase().slice(0, 6);
                        if (middlename) username += middlename[0].toLowerCase();
                        username += names[0].toLowerCase().slice(0, 2);
                        const pwd = nanoid.nanoid(8);
                        const password = await bcrypt.hash(pwd, 10);
                        userPasswords[classIndex].push({ username, pwd });
                        await this.query(
                            "INSERT INTO users (username, name, middlename, surname, password, class_id, type_id) VALUE (?,?,?,?,?,?,?)",
                            [
                                username,
                                names[0].replace("\r", ""),
                                middlename,
                                surname,
                                password,
                                classIndex + 1,
                                classIndex + 1 === 6 ? 2 : 1,
                            ],
                        );
                    }
                }
            }
            fs.writeFile(__dirname + "/users.json", JSON.stringify(userPasswords), (err) => {
                if (err) console.error(err);
            });
            console.log("Initialized users!");
        });
    }

    async query(query, params) {
        const conn = await this.connect();
        try {
            return await conn.query(query, params);
        } finally {
            conn.release();
        }
    }
}

module.exports = new DB();
