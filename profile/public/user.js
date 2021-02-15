const uid = new URL(window.location.href).searchParams.get("uid");
const userDiv = document.getElementById("user");
const commentsDiv = document.getElementById("comments");
const charDiv = document.getElementById("char");

let charMethod = "POST";

if (uid < 1 || uid > 119) window.location.assign("./users.html"); // Well

async function addUser(userData) {
    const resp = await (await fetch("/auth/api/status")).json();
    if (!resp.admin) {
        const { user } = userData;
        const h1 = document.createElement("h1");
        h1.textContent = `${user.name} ${user.middlename || ""} ${user.surname}`;
        userDiv.append(h1);
        document.querySelector("title").textContent = h1.textContent;
        return;
    }
    const divs = [];
    const questions = userData.questions;
    const user = userData.user;
    for (const questionID in questions) {
        if (!questions.hasOwnProperty(questionID) || questions[questionID].type === "file") continue;
        const question = questions[questionID];
        const div = document.createElement("div");
        div.innerHTML = `<b>${question.question.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b> <span>${
            (question.answer || "nichts").replace(/</g, "&lt;").replace(/>/g, "&gt;") || ""
        }</span>`;
        divs.push(div);
    }
    const h1 = document.createElement("h1");
    h1.textContent = `${user.name} ${user.middlename || ""} ${user.surname}`;
    document.querySelector("title").textContent = h1.textContent;
    h1.addEventListener("click", (evt) => {
        const qDivs = evt.target.parentElement.querySelectorAll("div");
        qDivs.forEach(
            (div) => (div.style.display = !div.style.display || div.style.display === "block" ? "none" : "block"),
        );
        if (h1.classList.contains("bananenkuchen")) h1.classList.remove("bananenkuchen");
        else h1.classList.add("bananenkuchen");
    });
    userDiv.append(h1, ...divs);
}

async function addComments(comments) {
    const h2 = document.createElement("h2");
    h2.textContent = "Kommentare";
    h2.addEventListener("click", (evt) => {
        const qDivs = evt.target.parentElement.querySelectorAll("div");
        qDivs.forEach(
            (div) => (div.style.display = !div.style.display || div.style.display === "flex" ? "none" : "flex"),
        );
        if (h2.classList.contains("bananenkuchen")) h2.classList.remove("bananenkuchen");
        else h2.classList.add("bananenkuchen");
    });
    const divs = [];
    for (const comment of comments) {
        const div = document.createElement("div");
        div.dataset.id = comment.id;
        const span = document.createElement("span");
        span.textContent = comment.comment;
        if ("user" in comment && Object.keys(comment.user).length > 0) {
            span.innerHTML += ` <small>- ${comment.user.name} ${comment.user.middlename || ""} ${
                comment.user.surname
            }</small>`;
        }
        div.append(span);

        if (comment.owner) {
            const buttons = document.createElement("div");
            buttons.classList.add("control-buttons");

            const del = document.createElement("span");
            del.classList.add("delete-btn");
            del.addEventListener("click", async (evt) => {
                if (!confirm("Bist du sicher, dass du den Kommentar löschen willst?")) return;
                const body = JSON.stringify({
                    pid: uid,
                    cid: evt.target.parentElement.parentElement.dataset.id,
                });
                const resp = await fetch("api/comment", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body,
                });
                const res = await resp.json();
                if (res.success) window.location.reload();
            });

            const edit = document.createElement("span");
            edit.classList.add("edit-btn");
            edit.addEventListener("click", (evt) => {
                const updateDiv = document.createElement("div");
                updateDiv.id = "edit-div";

                const inputDiv = document.createElement("div");
                const input = document.createElement("textarea");
                input.placeholder = "Dein Kommentar...";
                input.value = comment.comment;
                const submit = document.createElement("input");
                submit.type = "submit";
                submit.value = "Speichern";
                submit.classList.add("pure-button", "pure-button-primary");

                submit.addEventListener("click", async () => {
                    const body = JSON.stringify({
                        pid: uid,
                        cid: evt.target.parentElement.parentElement.dataset.id,
                        comment: input.value,
                    });
                    const resp = await fetch("api/comment", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body,
                    });
                    const res = await resp.json();
                    if (res.success) window.location.reload();
                });

                inputDiv.append(input, submit);
                updateDiv.append(inputDiv);
                div.insertAdjacentElement("beforebegin", updateDiv);
                commentsDiv.removeChild(div);
            });

            buttons.append(edit, del);
            div.append(buttons);
        }
        divs.push(div);
    }

    commentsDiv.append(h2, ...divs);

    const addDiv = document.createElement("div");
    addDiv.id = "add-div";
    const add = document.createElement("span");
    add.classList.add("add-btn");
    add.addEventListener("click", (evt) => {
        const div = document.createElement("div");
        const input = document.createElement("textarea");
        input.placeholder = "Dein Kommentar...";
        const submit = document.createElement("input");
        submit.type = "submit";
        submit.value = "Hinzufügen";
        submit.classList.add("pure-button", "pure-button-primary");

        submit.addEventListener("click", async (evt) => {
            const comment = input.value;
            console.log(comment);
            const body = JSON.stringify({ comment, pid: uid });
            const resp = await fetch("api/comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });
            const res = await resp.json();
            console.log(res);
            if (res.success) window.location.reload();
        });
        div.append(input, submit);
        addDiv.removeChild(add);
        addDiv.append(div);
    });
    addDiv.append(add);
    commentsDiv.append(addDiv);
}

function addChar(char) {
    const h2 = document.createElement("h2");
    h2.textContent = "Erkennungsmerkmal (bitte nur eins)";
    h2.addEventListener("click", (evt) => {
        const divs = evt.target.parentElement.querySelectorAll("div");
        divs.forEach(
            (div) => (div.style.display = !div.style.display || div.style.display === "flex" ? "none" : "flex"),
        );
        if (h2.classList.contains("bananenkuchen")) h2.classList.remove("bananenkuchen");
        else h2.classList.add("bananenkuchen");
    });
    const inp = document.createElement("input");
    const btn = document.createElement("button");
    btn.classList.add("pure-button", "pure-button-primary");
    btn.textContent = "Senden";

    if (char.hasOwnProperty("txt")) {
        charMethod = "PUT";
        inp.value = char.txt;
    }

    inp.maxLength = 255;

    btn.addEventListener("click", async (e) => {
        if (inp.value.length < 3) {
            alert("Bitte gebe dir etwas mehr Mühe. Der Text sollte schon etwas länger sein.");
            return;
        }

        const char = inp.value;
        const body = JSON.stringify({ char });
        const resp = await fetch(`api/char/${uid}`, {
            method: charMethod,
            headers: { "Content-Type": "application/json" },
            body,
        });
        const res = await resp.json();
        if (res.success) {
            charMethod = "PUT";
            alert("Okidoki, danke!");
        } else {
            alert("Fehler, sorry");
        }
    });
    const div = document.createElement("div");
    div.style.display = "flex";
    div.append(inp, btn);
    charDiv.append(h2, div);
}

fetch(`api/user/${uid}`)
    .then((response) => response.json())
    .then(addUser);

fetch(`api/comments/${uid}`)
    .then((response) => response.json())
    .then(addComments);

fetch(`api/char/${uid}`)
    .then((response) => response.json())
    .then(addChar);
