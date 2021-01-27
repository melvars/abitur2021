#!/usr/bin/env node
require("dotenv").config();
const db = require("./db");
const fs = require("fs");

const params = process.argv.slice(2);

let idx;
if ((idx = params.indexOf("-r")) > -1) {
    // DB management
    const param = params[idx + 1];
    switch (param) {
        case "all":
            db.resetAll()
                .then(() => console.info("Regenerated everything!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "motto":
            db.resetMottovote()
                .then(() => console.info("Reset motto voting!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "poll":
            db.resetPolls()
                .then(() => console.info("Reset polls!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "profile":
            db.resetProfiles()
                .then(() => console.info("Reset profiles!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "quotes":
            db.resetQuotes()
                .then(() => console.info("Reset quotes!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "questions":
            db.resetQuestions()
                .then(() => console.info("Reset questions!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "char":
            db.resetCharacteristics()
                .then(() => console.info("Reset char!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        default:
            console.info("Nothing to do!");
            process.exit(0);
            break;
    }
} else if ((idx = params.indexOf("-d")) > -1) {
    // TODO: More dumping
    db.dump().then((data) => {
        data.users.forEach((user) => {
            const textex = `\\student\n\\studentimages{${user.username}}\n\\studentprofile{${user.name} ${
                user.middlename || ""
            } ${
                user.surname
            }}{18.12.2002}{Mathematik}{Schlafen}{Canadian Pop}{Herr Schwarz}{Gehirn}{Cogito ergo sum}\n\\studenttable{Meistens wunderhübsch}{Essen}`;
            fs.writeFile(
                __dirname + "/zeitung/parts/students/" + user.class + "/" + user.username + ".tex",
                textex,
                (err) => {
                    if (err) console.error(err);
                },
            );
        });
    });
    console.log("Probably finished.. Async?");
} else if ((idx = params.indexOf("-U")) > -1) {
    // Update management (e.g.: add new poll options)
    const param = params[idx + 1];
    if (!param) process.exit(1);
    switch (param) {
        case "all":
            console.info("Updating motto votes, polls and profile!");
            db.initMottovote()
                .then(() => console.info("Updating motto votes!"))
                .then(() => db.initPolls())
                .then(() => console.info("Updating polls!"))
                .then(() => db.initProfiles())
                .then(() => console.info("Updating profile!"))
                .then(() => db.initQuestions())
                .then(() => console.info("Updating Quotes"))
                .then(() => process.exit(0))
                .catch(console.error);

            break;
        case "motto":
            db.initMottovote()
                .then(() => console.info("Updating motto votes!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "poll":
            db.initPolls()
                .then(() => console.info("Updating polls!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "profile":
            db.initProfiles()
                .then(() => console.info("Updating profile!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        case "questions":
            db.initQuestions()
                .then(() => console.info("Updating questions!"))
                .then(() => process.exit(0))
                .catch(console.error);
            break;
        default:
            console.info("Nothing to do!");
            process.exit(0);
            break;
    }
} else if ((idx = params.indexOf("--user")) > -1) {
    // User management (e.g.: Regen user pwd)
    const uid = params[idx + 1];
    if (!uid) process.exit(1);
    db.regenerateUser(uid)
        .then(() => console.info("Regenerating user with id " + uid))
        .then(() => process.exit(0))
        .catch(console.error);
} else {
    console.log("Nothing to do!");
    process.exit(0);
}
