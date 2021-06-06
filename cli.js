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
    // WARNING: UGLY AND INEFFICIENT!
    // Coding rule: Everything is acceptable if the total execution time doesn't exceed 5s

    const sanitize = (text) =>
        text
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\\/g, "\\\\")
            .replace(/%/g, "\\%")
            .replace(/&/g, "\\&")
            .replace(/_/g, "\\_")
            .replace(/#/g, "\\#")
            .replace(/\^/g, "\\^")
            .replace(
                /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
                "{ \\emojifont $&}",
            )
            .replace(/~/g, "$\\mathtt{\\sim}$");

    // Quotes in QR codes destroy everything
    const sanitizeQR = (text) => text.replace(/"/g, "").replace(/ /g, "\\ ");

    let hay;
    const answer = (needle) => {
        const e = hay.find((e) => e.question === needle);
        if (e && e.answer && e.answer.length > 1) return sanitize(e.answer);
        else return "nichts";
    };

    const classes = ["teacher", "TGM13.1", "TGM13.2", "TGTM13", "TGI13.1", "TGI13.2"];

    // Be aware, I'm a longtime rhyme primer
    db.dump().then(async (data) => {
        const y10progs = JSON.parse(await fs.readFile(__dirname + "/progs.json", "utf8"));
        await data.users.forEach(async (user) => {
            hay = data.profile.filter((e) => e.user_id === user.id);
            let comments = user.comments;
            const chars = user.chars;
            const obj = {
                id: user.id,
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

            obj.birthday = new Date(obj.birthday).toLocaleDateString("de");
            if (obj.birthday == "Invalid Date") obj.birthday = "unbekannt";

            // QR-Code
            obj.qrcode = sanitizeQR(answer("QR-Code Text (z.B. Social Media Links, random Text, whatever)"));
            if (obj.qrcode === "nichts") obj.qrcode = "";

            // 5head
            let textex = "";
            for (elem of Object.keys(obj)) {
                textex += `\\def\\std${elem}{${obj[elem]}}`;
            }

            textex += `\\student\\studentbackground{${obj.id}}{${obj.qrcode}}\n\n`;

            // Characteristics olympics kinetics acoustics
            textex += "\\begin{center}\\begin{minipage}{0.75\\paperwidth}\\begin{center}\n";
            if (chars && chars.length > 0) {
                chars.forEach((char, ind) => {
                    textex += `\\studentchar{${sanitize(char.txt)}`;
                    if (chars[ind + 1]) textex += "  $\\circ$";
                    textex += "}";
                });
            }
            textex += "\\end{center}\\end{minipage}\\end{center}\n";

            textex += "\\divider";
            if (y10progs[user.id] && y10progs[user.id].length > 0)
                comments = [...comments, ...y10progs[user.id].map((comment) => ({ comment }))];

            comments = comments.sort((a, b) => a.comment.length - b.comment.length);

            // Comments contents intents indents events
            if (comments && comments.length > 0) {
                textex +=
                    "\n\n\\begin{small}\\renewcommand{\\arraystretch}{1.5}\\hspace*{\\commentsx}\\begin{tabularx}{\\commentswidth}{*{2}{>{\\RaggedRight\\arraybackslash}X}}";
                for (let i = 0; i < comments.length; i += 2) {
                    const first = comments[i].comment;
                    if (comments[i] && !comments[i + 1]) {
                        textex += `\\multicolumn{2}{p{\\commentswidth}}{\\RaggedRight{${sanitize(first)}}}`;
                        break;
                    }

                    const second = comments[i + 1] ? comments[i + 1].comment : " ";
                    textex += `${sanitize(first)} & ${sanitize(second)} \\\\\n`;
                    if (i + 2 < comments.length) textex += " \\specialrule{.03em}{0em}{0em}\n";
                }
                textex += "\\end{tabularx}\\renewcommand{\\arraystretch}{1}\\end{small}";
            }

            await fs.writeFile(
                __dirname + "/zeitung/parts/generated/students/" + user.class + "/" + user.username + ".tex",
                textex,
            );
        });

        // Stats chats hats cats rats
        let textex = "";
        const questions = [...new Set(data.questions.map((a) => a[0].id))];
        const statrad = 2.5;
        const statxinc = 8,
            statyinc = 6;
        let statx = 0,
            staty = 0;
        await questions.forEach((q) => {
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

        // Ranking pranking banking yanking // Confusion ftw - don't ask :P
        const rankingStart = "\\ranking\n\\begin{longtable}{R R R}\n\n";
        const rankingEnd = "\\end{longtable}\n";
        const rankingtex = ["", "", "", "", "", ""];
        data.ranking.forEach((q) => {
            const answers = [[], [], [], [], [], []];

            q.answers.forEach((a) => {
                answers[classes.indexOf(a.class)].push({
                    name: `${a.name} ${a.surname}`,
                    count: a.count,
                });
            });

            answers.forEach((elem, ind) => {
                if ((q.type != "teacher" || ind == 0) && (q.type == "teacher" || ind != 0)) {
                    const relevant = elem.slice(0, 3);
                    const total_votes = relevant.reduce((a, b) => a + b.count, 0);
                    let catted = "";
                    relevant.forEach((e, eind) => {
                        let fitted = Math.ceil((e.count / total_votes) * 3); // 3 is max bottle count
                        fitted = fitted == 0 ? 1 : fitted > 3 ? 3 : fitted; // Adjust float errors
                        catted += `${e.name} @ \\rankingbottles{${fitted}}`;
                        if (eind < 2) catted += "BLABLAB\n";
                        else catted += "\n\\vspace*{0.5cm}";
                    });
                    rankingtex[
                        ind
                    ] += `\\rankingquestion{${q.question}}\n\\begin{tabular}{l l}\n${catted}\\end{tabular}`;

                    // This is 10head
                    const cntamp = rankingtex[ind].split("&").length - 1;
                    const cntslash = rankingtex[ind].split("\\\\\n").length;
                    if ((cntamp + cntslash) % 3 == 0) rankingtex[ind] += "\\\\\n";
                    else rankingtex[ind] += "&\n";
                }
            });
        });
        await rankingtex.forEach(async (tex, ind) => {
            await fs.writeFile(
                __dirname + `/zeitung/parts/generated/ranking/${classes[ind]}.tex`,
                rankingStart + tex.replace(/@/g, "&").replace(/BLABLAB/g, "\\\\") + rankingEnd,
            );
        });

        // Quotes boats coats floats goats oats
        textex = "\\def\\quoteclass{TGM13.1}\n\\quotepage";
        let i = 0;
        for (const quote of data.quotes) {
            if (i > 1 && quote.class !== data.quotes[i - 1].class) {
                await fs.writeFile(
                    __dirname + `/zeitung/parts/generated/quotes/${data.quotes[i - 1].class}.tex`,
                    textex,
                );
                textex = `\\def\\quoteclass{${quote.class}}\n\\quotepage`;
            }
            textex += `\\quoteadd{${quote.name} ${quote.middlename || ""} ${quote.surname}}{${sanitize(
                quote.quote,
            )}}\n`;
            i++;
        }
        // Lol
        await fs.writeFile(__dirname + "/zeitung/parts/generated/quotes/teacher.tex", textex);

        // SECRET!!
        textex = "\\begin{longtable}{R R R}\n\n";
        await data.secrets.forEach(async (secret, ind) => {
            textex += `{\\small ${secret.secret}}`;
            textex += ((ind + 1) % 3 == 0 ? "\\\\" : "&") + "\n";
            if ((ind + 1) % 3 == 0) textex += "\\specialrule{.03em}{0em}{0em}\n";
        });
        textex += "\\end{longtable}\n";
        await fs.writeFile(__dirname + "/zeitung/parts/generated/secrets.tex", textex);

        // Final spinal vinyl
        textex = "\\begin{tabular}{l l l}\n\n";
        await data.users.forEach(async (user, ind) => {
            textex += `{\\large ${user.name} ${user.middlename || ""} ${user.surname}}`;
            textex += ((ind + 1) % 3 == 0 ? "\\\\" : "&") + "\n";
        });
        textex += "\\end{tabular}\n";
        await fs.writeFile(__dirname + "/zeitung/parts/generated/final.tex", textex);

        textex = "";
        const profs = (await fs.readFile(__dirname + "/stecks.csv", "utf8")).split("\n").slice(1, -1);
        let flip = 1;
        for (const prof of profs) {
            const [t, a, p, s] = prof.split(";").map(sanitize);
            textex += `\\def\\profname{${t}}\\def\\profabi{${a}}\\def\\profprof{${p}}\\def\\profsecret{${s}}\\def\\profnum{${flip}}\\def\\proflast{${+(
                flip % 3 ===
                0
            )}}\\teacherprofile\n`;
            if (flip % 3 === 0) {
                textex += "\\clearpage\n";
            }
            flip++;
        }
        await fs.writeFile(__dirname + "/zeitung/parts/generated/teacherprofiles.tex", textex, "utf8");

        console.log("Probably finished?");
    });
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
