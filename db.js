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
        this.query("SELECT * FROM users").then((res) => {
            if (res.length === 0) this.initValues();
        });
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
        });
    }

    initValues() {
        fs.readFile(__dirname + "/names.csv", "utf8", (err, data) => {
            if (err) throw err;
            const classes = data.split("--");
            classes.forEach((clazz, classIndex) => {
                const students = clazz.split("\n");
                students.forEach(async (student) => {
                    // Fix undefined
                    if (student && student.length > 3) {
                        const [_, surname, name] = student.split(",");
                        const names = name.split(" ");
                        const middlename = names.length > 1 && names[1] ? names.slice(1).join(" ") : null;
                        let username = surname.toLowerCase().slice(0, 6);
                        if (middlename) username += middlename[0].toLowerCase();
                        username += names[0].toLowerCase().slice(0, 2);
                        const pwd = nanoid.nanoid(8);
                        const password = await bcrypt.hash(pwd, 12);
                        await this.query(
                            "INSERT INTO users (username, name, middlename, surname, password, class_id, type_id) VALUE (?,?,?,?,?,?,?)",
                            [username, names[0].replace("\r", ""), middlename, surname, password, classIndex + 1, 2]
                        );
                    }
                });
            });
        });
    }

    async query(query, params) {
        const conn = await this.connect();
        try {
            return await conn.query(query, params);
        } catch (e) {
            throw e;
        } finally {
            conn.release();
        }
    }
}

module.exports = new DB();
