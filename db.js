const mariadb = require("mariadb");
const bcrypt = require("bcrypt");
const nanoid = require("nanoid");
const fs = require("fs").promises;

class DB {
    constructor() {
        this.pool = mariadb.createPool({
            host: process.env.DBHost,
            user: process.env.DBUser,
            password: process.env.DBPassword,
            database: process.env.DBName,
        });
    }

    connect() {
        return this.pool.getConnection();
    }

    async init() {
        const tables = await this.getTables();
        for (const table of tables) if (table && table.length > 1) await this.query(table);
        console.info("Database initialized!");
        const res = await this.query("SELECT id FROM users LIMIT 1");
        if (res.length === 0) await this.initValues();
    }

    async initValues() {
        await this.query("INSERT INTO types (name) VALUES ('pupil'), ('teacher')");
        await this.query(
            "INSERT INTO class (name) VALUES ('TGM13.1'), ('TGM13.2'), ('TGTM13.1'), ('TGI13.1'), ('TGI13.2'), ('teacher')",
        );

        await this.initPolls();
        await this.initMottovote();
        await this.initProfiles();
        await this.initQuestions();
        await this.initUsers();
    }

    async resetAll() {
        await this.regenerateTables();
        await this.initValues();
    }

    async regenerateTables() {
        const drops = await fs.readFile(__dirname + "/drop.sql", "utf8");
        for (const stmt of drops.split(";")) if (stmt && stmt.length > 1) await this.query(stmt);
        const tables = await this.getTables();
        for (const table of tables) if (table && table.length > 1) await this.query(table);
    }

    async resetQuotes() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS quotes");
        await this.query(tables[3]);
    }

    async resetSecrets() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS secrets");
        await this.query(tables[17]);
    }

    async resetProfiles() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS profile_comments");
        await this.query("DROP TABLE IF EXISTS profile_answers");
        await this.query("DROP TABLE IF EXISTS profile_questions");
        await this.query("DROP TABLE IF EXISTS profile_input_types");
        await this.query(tables[8]);
        await this.query(tables[9]);
        await this.query(tables[10]);
        await this.query(tables[11]);
        await this.initProfiles();
    }

    async initProfiles() {
        const types = ["number", "file", "date", "text", "color"];
        for (const type of types) {
            try {
                await this.query("INSERT INTO profile_input_types (type) VALUES (?)", type);
            } catch (e) {
                continue;
            }
        }

        const data = await fs.readFile(__dirname + "/profile.txt", "utf8");
        const questions = data.split("\n");
        for (const question of questions) {
            if (question) {
                const [q, type] = question.split(" - ");
                await this.query("INSERT INTO profile_questions (question, question_type) VALUE (?, ?)", [
                    q,
                    types.indexOf(type) + 1,
                ]).catch(() => console.log("Profile question already exists!"));
            }
        }
    }

    async resetMottovote() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS motto_votes");
        await this.query("DROP TABLE IF EXISTS mottos");
        await this.query(tables[6]);
        await this.query(tables[7]);
        await this.initMottovote();
    }

    async initMottovote() {
        const data = await fs.readFile(__dirname + "/mottos.txt", "utf8");
        const mottos = data.split("\n");
        for (const motto of mottos) {
            const [name, desc] = motto.split(" - ");
            if (motto) {
                await this.query("INSERT INTO mottos (name, description) VALUES (?, ?)", [name, desc]).catch(() =>
                    console.log("Vote option already exists!"),
                );
            }
        }
    }

    async resetPolls() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS ranking_questions");
        await this.query("DROP TABLE IF EXISTS ranking_answers");
        await this.query(tables[4]);
        await this.query(tables[5]);
        await this.initPolls();
    }

    async initPolls() {
        const data = await fs.readFile(__dirname + "/poll.txt", "utf8");
        const parts = data.split("--");
        for (const [i, part] of parts.entries()) {
            const questions = part.split("\n");
            for (const question of questions) {
                if (question) {
                    await this.query("INSERT INTO ranking_questions (question, type_id) VALUE (?,?)", [
                        question,
                        i + 1,
                    ]).catch(() => console.log("Poll question already exists!"));
                }
            }
        }
    }

    async initUsers() {
        const data = await fs.readFile(__dirname + "/names.csv", "utf8");
        const classes = data.split("--");
        const userPasswords = {};
        console.log("Generating users");
        for (const [classIndex, clazz] of classes.entries()) {
            const students = clazz.split("\n");
            userPasswords[classIndex] = [];
            for (const student of students) {
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
        await fs.writeFile(__dirname + "/users.json", JSON.stringify(userPasswords));
        console.log("Initialized users!");
    }

    async initQuestions() {
        const data = (await fs.readFile(__dirname + "/questions.txt", "utf8")).split("\n");
        for (const question of data) {
            try {
                const [q, a] = question.split(" - ");
                const { insertId } = await this.query("INSERT INTO question_questions (question) VALUE (?)", [q]);
                for (const answer of a.split(",")) {
                    await this.query("INSERT INTO question_options (answer_option, question_id) VALUE (?,?)", [
                        answer,
                        insertId,
                    ]);
                }
            } catch (e) {
                console.error(e);
                console.info("Question already exists!");
            }
        }
    }

    async resetQuestions() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS question_answers");
        await this.query("DROP TABLE IF EXISTS question_options");
        await this.query("DROP TABLE IF EXISTS question_questions");
        await this.query(tables[12]);
        await this.query(tables[13]);
        await this.query(tables[14]);
        await this.initQuestions();
    }

    async resetCharacteristics() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS profile_char");
        await this.query(tables[15]);
    }

    async resetTeacherPredict() {
        const tables = await this.getTables();
        await this.query("DROP TABLE IF EXISTS teacher_prediction");
        await this.query(tables[16]);
    }

    async regenerateUser(uid) {
        const pwd = nanoid.nanoid(8);
        const password = await bcrypt.hash(pwd, 10);
        await this.query("UPDATE users SET password = ? WHERE id = ?", [password, uid]);
        console.log(`New password for ${uid}: ${pwd}`);
    }

    async dump() {
        const users = await this.query(
            "SELECT u.id, u.username, u.name, u.middlename, u.surname, c.name class, t.name type FROM users u INNER JOIN class c ON u.class_id = c.id INNER JOIN types t ON u.type_id = t.id WHERE t.name = 'pupil'",
        );
        const profile = await this.query(
            "SELECT q.question, a.answer, a.user_id FROM profile_questions q INNER JOIN profile_answers a ON a.question_id = q.id",
        );
        return { users, profile };
    }

    async query(query, params) {
        const conn = await this.connect();
        try {
            return await conn.query(query, params);
        } finally {
            conn.release();
        }
    }

    async getTables() {
        return (await fs.readFile(__dirname + "/tables.sql", "utf8")).split(";");
    }
}

module.exports = new DB();
