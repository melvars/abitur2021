const mariadb = require("mariadb");
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
            const conn = await this.connect();
            for (const query of queries) await conn.query(query);
            console.log("Tables created!");
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
