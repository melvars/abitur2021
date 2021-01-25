const query = new URL(window.location.href).searchParams;
const type = query.get("type");
const qid = query.get("qid") || 0;
let method = "POST";

const dropdown = document.getElementById("answer");
const question_input = document.getElementById("question");
const question_label = document.getElementById("question_label");
const submit = document.getElementById("submit-btn");
const prev = document.getElementById("prev-btn");
const skip = document.getElementById("skip-btn");
const progress = document.getElementById("progress");

if (!["teacher", "pupil"].includes(type)) window.location.href = "/";

dropdown.insertAdjacentHTML(
    "beforeend",
    '<option value="" selected disabled>' + (type === "teacher" ? "Lehrer" : "Schüler") + "/in auswählen...</option>",
);
document.querySelector("legend").innerText = type === "teacher" ? "Lehrer-Ranking" : "Schüler-Ranking";
document.querySelector("p").innerText = "Welche/r " + (type === "teacher" ? "Lehrer/in" : "Schüler/in") + "...";

skip.addEventListener("click", () => getNext(parseInt(qid) + 1));
prev.addEventListener("click", () => getNext(parseInt(qid) - 1));

if (qid == 0) {
    prev.style.display = "none";
    skip.style.width = "100%";
}

function appendOption(response) {
    response.forEach((elem) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] + " " : ""}${
                elem["surname"]
            }</option>`,
        );
    });
}

fetch("/auth/api/list" + (type === "teacher" ? "?class=teacher" : ""))
    .then((response) => response.json())
    .then((response) => appendOption(response))
    .then(() => {
        fetch(`/poll/api/question/${qid}?type=${type}`)
            .then((response) => response.json())
            .then((response) => {
                if (!response.empty()) {
                    question_label.innerText = response["question"];
                    question_input.setAttribute("value", response["id"]);
                    if (response.answer) {
                        for (const c of dropdown.children) if (+c.value === response.answer) c.selected = true;
                        method = "PUT";
                    }
                    submit.addEventListener("click", async () => {
                        await request();
                        getNext(parseInt(qid) + 1);
                        if (method === "POST") method = "PUT";
                    });
                } else getNext(); // Resets
            });
    });

fetch(`api/questions/${type}`)
    .then((response) => response.json())
    .then((response) => {
        for (const elem of response) {
            progress.insertAdjacentHTML(
                "beforeend",
                `<div data-current="${elem.id == qid}" data-answered="${elem.answered}">${elem.id + 1}</div>`,
            );
        }
    })
    .then(() => {
        document.querySelectorAll("div.bar div").forEach((elem) => {
            elem.addEventListener("click", () => {
                getNext(+elem.innerText - 1);
            });
        });
    });

function getNext(q = 0) {
    window.location.assign(`/poll/?qid=${q}&type=${type}`);
}

async function request() {
    const body = JSON.stringify({
        question: question_input.value,
        answer: dropdown.value,
    });
    const resp = await fetch(`api/answer/${type}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
    });
    return resp.json();
}

// I did this myself lel
Object.prototype.empty = function () {
    return Object.keys(this).length === 0;
};
