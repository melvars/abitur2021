#!/usr/bin/env node
require("dotenv").config();
const db = require("./db");
const fs = require("fs").promises;

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
        case "secrets":
            db.resetSecrets()
                .then(() => console.info("Reset secrets!"))
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
    // TODO: Erkennungsmerkmale, Wohnort??
    // WARNING: UGLY!

    const sanitize = (text) =>
        text
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\\/g, "\\\\")
            .replace(/&/g, "\\&")
            .replace(/_/g, "\\_")
            .replace(/\^/g, "\\^")
            .replace(/~/g, "$\\mathtt{\\sim}$");

    let hay;
    const answer = (needle) => {
        const e = hay.find((e) => e.question === needle);
        if (e && e.answer && e.answer.length > 1) return sanitize(e.answer);
        else return "nichts";
    };

    // Be aware, I'm a longtime rhyme primer
    db.dump().then((data) => {
        data.users.forEach(async (user) => {
            hay = data.profile.filter((e) => e.user_id === user.id);
            const comments = user.comments;
            const chars = user.chars;
            const obj = {
                id: user.id - 1, // Why tf tho
                name: `${user.name} ${user.middlename || ""} ${user.surname}`,
                birthday: answer("Geburtsdatum"),
                favsub: answer("Lieblingsfach"),
                hatesub: answer("Hassfach"),
                hobbies: answer("Hobbies"),
                music: answer("Lieblingsbands/-musiker/-genre"),
                missing: answer("Am meisten werde ich vermissen"),
                motivation: answer("Ohne das hätte ich die Oberstufe nicht geschafft"),
                quote: answer("Lebensmotto/Seniorquote"),
                future: answer("Zukunftspläne"),
            };

            obj.birthday = new Date(obj.birthday == "nichts" ? "1.1.2000" : obj.birthday).toLocaleDateString("de");

            // 5head
            let textex = "";
            Object.keys(obj).forEach((elem) => {
                textex += `\\def\\std${elem}{${obj[elem]}}`;
            });

            textex += "\\student\n\n";

            // Characteristics olympics kinetics acoustics
            if (chars && chars.length > 0) {
                chars.forEach((char, ind) => {
                    textex += `\\studentchar{${sanitize(char.txt)}`;
                    if (chars[ind + 1]) textex += " \\textbar";
                    textex += "}";
                });
            }

            textex += "\\divider";

            // Comments contents intents indents events
            if (comments && comments.length > 0) {
                textex +=
                    "\n\n\\renewcommand{\\arraystretch}{1.5}\\hspace*{\\commentsx}\\begin{tabularx}{\\commentswidth}{*{2}{>{\\RaggedRight\\arraybackslash}X}}";
                for (let i = 0; i < comments.length; i += 2) {
                    const first = comments[i].comment;
                    const second = comments[i + 1] ? comments[i + 1].comment : " ";
                    textex += `${sanitize(first)} & ${sanitize(second)} \\\\`;
                }
                textex += "\\end{tabularx}\\renewcommand{\\arraystretch}{1}";
            }

            await fs.writeFile(
                __dirname + "/zeitung/parts/generated/students/" + user.class + "/" + user.username + ".tex",
                textex,
            );

            // Stats chats hats cats rats
            textex = "";
            const questions = [...new Set(data.questions.map((a) => a[0].id))];
            const statrad = 2.5;
            const statxinc = 8,
                statyinc = 6;
            let statx = 0,
                staty = 0;
            questions.forEach((q) => {
                const options = data.questions[q - 1].sort((a, b) => b.count - a.count);
                textex += `\\node at (${statx}, ${staty + statrad / 2 + 1.5}) {${options[0].question}};`;
                textex += `\\pie[hide number, sum=auto, text=inside, pos={${statx},${staty}}, radius=${statrad}]{`;
                options.forEach((option, ind) => {
                    textex += `${option.count}/${sanitize(option.option)}`;
                    if (options[ind + 1]) textex += ", ";
                });
                textex += "}\n";

                if (statx == statxinc) {
                    staty += statyinc;
                    statx = 0;
                } else {
                    statx = statxinc;
                }
            });

            await fs.writeFile(__dirname + "/zeitung/parts/generated/stats/perc.tex", textex);

            // Teacher ranking pranking banking yanking
            const rankingStart = "\\begin{tabularx}{\\textwidth}{*{3}{>{\\RaggedRight\\arraybackslash}X}}\n";
            const rankingEnd = "\\end{tabularx}\n";
            textex = "\\ranking" + rankingStart;
            const teacher_ranking = data.ranking.filter((e) => e.type === "teacher");
            teacher_ranking.forEach((e, ind) => {
                textex += "\\begin{itemize}\n";
                textex += `\\rankingquestion{${e.question}}\n`;
                const a = e.answers;
                for (let i = 0; i < 3; i++) {
                    textex += `\\rankinganswer{${a[i].name} ${a[i].surname}}{${a[i].count}}\n`;
                }
                textex += "\\end{itemize}";

                if (ind == 17) {
                    textex += "\\clearpage";
                    textex += rankingEnd + rankingStart;
                } else {
                    if ((ind + 1) % 3 == 0) textex += "\\\\\n";
                    else textex += "&\n";
                }
            });
            textex += rankingEnd;

            await fs.writeFile(__dirname + "/zeitung/parts/generated/ranking/teacher.tex", textex);

            // Quotes boats coats floats goats oats
            textex = "";
        });
    });
    console.log("Probably finished?");
    // process.exit(0);
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
        .then((pwd) => console.info(`Regenerating user with id ${uid}: ${pwd}`))
        .then(() => process.exit(0))
        .catch(console.error);
} else {
    console.log("Nothing to do!");
    process.exit(0);
}
