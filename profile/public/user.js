const uid = new URL(window.location.href).searchParams.get("uid");
const userDiv = document.getElementById("user");
const commentsDiv = document.getElementById("comments");

if (uid < 1 || uid > 119) window.location.assign("./users.html"); // Well

function addUser(userData) {
    const divs = [];
    const questions = userData.questions;
    const user = userData.user;
    for (const questionID in questions) {
        if (!questions.hasOwnProperty(questionID)) continue;
        const question = questions[questionID];
        const div = document.createElement("div");
        div.innerHTML = `<b>${question.question}</b>: <span>${question.answer || ""}</span>`;
        divs.push(div);
    }
    const h1 = document.createElement("h1");
    h1.textContent = `${user.name} ${user.middlename || ""} ${user.surname}`;
    h1.addEventListener("click", (evt) => {
        const qDivs = evt.target.parentElement.querySelectorAll("div");
        qDivs.forEach(
            (div) => (div.style.display = !div.style.display || div.style.display === "block" ? "none" : "block"),
        );
    });
    userDiv.append(h1, ...divs);
}

async function addComments(comments) {
    const h1 = document.createElement("h1");
    h1.textContent = "Kommentare";
    h1.addEventListener("click", (evt) => {
        const qDivs = evt.target.parentElement.querySelectorAll("div");
        qDivs.forEach(
            (div) => (div.style.display = !div.style.display || div.style.display === "flex" ? "none" : "flex"),
        );
    });
    const divs = [];
    for (const comment of comments) {
        const div = document.createElement("div");
        div.dataset.id = comment.id;
        const span = document.createElement("span");
        span.textContent = comment.comment;
        div.append(span);

        if (comment.owner) {
            const buttons = document.createElement("div");
            buttons.classList.add("control-buttons");

            const del = document.createElement("span");
            del.classList.add("delete-btn");
            del.textContent = "[Löschen]";
            del.addEventListener("click", async (evt) => {
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
            edit.textContent = "[Bearbeiten]";
            edit.addEventListener("click", (evt) => {
                const updateDiv = document.createElement("div");

                const input = document.createElement("input");
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

                updateDiv.append(input, submit);
                div.insertAdjacentElement("beforebegin", updateDiv);
                commentsDiv.removeChild(div);
            });

            buttons.append(edit, del);
            div.append(buttons);
        }
        divs.push(div);
    }

    commentsDiv.append(h1, ...divs);

    const addDiv = document.createElement("div");
    addDiv.id = "add-div";
    const add = document.createElement("span");
    add.classList.add("add-btn");
    add.textContent = "[Neuen Kommentar hinzufügen]";
    add.addEventListener("click", (evt) => {
        const div = document.createElement("div");
        const input = document.createElement("textarea");
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

fetch(`api/user/${uid}`)
    .then((response) => response.json())
    .then(addUser);

fetch(`api/comments/${uid}`)
    .then((response) => response.json())
    .then(addComments);
