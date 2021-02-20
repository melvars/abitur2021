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
        await this.query("DROP TABLE IF EXISTS profile_image_ratios");
        await this.query("DROP TABLE IF EXISTS profile_questions");
        await this.query("DROP TABLE IF EXISTS profile_input_types");
        await this.query(tables[8]);
        await this.query(tables[9]);
        await this.query(tables[10]);
        await this.query(tables[11]);
        await this.query(tables[18]);
        await this.initProfiles();
    }

    async initProfiles() {
        const types = ["number", "file", "date", "text", "color"];
        for (const type of types) {
            try {
                await this.query("INSERT INTO profile_input_types (type) VALUES (?)", type);
            } catch (e) {
                console.log(e);
            }
        }

        const data = await fs.readFile(__dirname + "/profile.txt", "utf8");
        const questions = data.split("\n");
        for (const question of questions) {
            if (question) {
                const [q, type, ...parameters] = question.split(" - ");
                let insertId;
                try {
                    insertId = (await this.query("INSERT INTO profile_questions (question, question_type) VALUE (?, ?)", [
                        q,
                        types.indexOf(type) + 1,
                    ])).insertId;
                } catch (e) {
                    console.log("Profile question already exists!");
                }
                if (type === "image") {
                    const [x, y] = parameters[0].split("/").map(v => parseInt(v));
                    console.log(insertId, x, y);
                    try {
                        await this.query("INSERT INTO profile_image_ratios (question_id, x, y) VALUE (?,?,?)", [insertId, x, y]);
                    } catch (e) {
                        console.log(e);
                    }
                }
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
        return pwd;
    }

    async dump() {
        // Users
        const users = await this.query(
            "SELECT u.id, u.username, u.name, u.middlename, u.surname, c.name class, t.name type FROM users u INNER JOIN class c ON u.class_id = c.id INNER JOIN types t ON u.type_id = t.id WHERE t.name = 'pupil'",
        );

        // Profile
        const profile = await this.query(
            "SELECT q.question, a.answer, a.user_id FROM profile_questions q INNER JOIN profile_answers a ON a.question_id = q.id",
        );

        // Questions (percentage)
        const rawQuestions = await this.query(
            "SELECT q.id, q.question question, o.answer_option option, COUNT(a.user_id) count FROM question_questions q INNER JOIN question_options o ON q.id = o.question_id INNER JOIN question_answers a ON o.id = a.option_id GROUP BY o.id",
        );
        const questions = [];
        rawQuestions.forEach((e) => {
            if (!questions[e.id - 1]) questions[e.id - 1] = [];
            questions[e.id - 1].push(e);
        });

        // Ranking
        const ranking = await this.query(
            "SELECT q.id, question, t.name type FROM ranking_questions q INNER JOIN types t ON type_id = t.id ORDER BY q.id",
        );
        const answers = await this.query(
            "SELECT question_id, u.name, u.middlename, u.surname, c.name class, count(*) count FROM ranking_questions q INNER JOIN ranking_answers a ON q.id = a.question_id INNER JOIN users u ON answer_id = u.id INNER JOIN class c ON u.class_id = c.id GROUP BY question_id, answer_id ORDER BY count DESC",
        );
        ranking.forEach((question) => (question.answers = []));
        answers.forEach((answer) => ranking.filter((q) => q.id === answer.question_id)[0].answers.push(answer));

        // Comments and characteristics
        for (const user of users) {
            user.comments = await this.query("SELECT comment from profile_comments where profile_id=" + user.id);
            user.chars = await this.query("SELECT txt from profile_char where profile_id=" + user.id);
        }

        const quotes = await this.query(
            "SELECT q.id, a.name, a.middlename, a.surname, q.quote, c.name class FROM quotes q INNER JOIN users a ON q.author_id = a.id INNER JOIN class c ON a.class_id = c.id ORDER BY c.id, a.surname, a.name, a.middlename",
        );

        return { users, profile, questions, ranking, quotes };
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
