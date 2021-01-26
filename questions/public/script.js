const query = new URL(window.location.href).searchParams;
const qid = +query.get("qid") || 0;
let method = "POST";

const question_input = document.getElementById("question");
const question_label = document.getElementById("question_label");
const prev = document.getElementById("prev-btn");
const skip = document.getElementById("skip-btn");
const progress = document.getElementById("progress");

skip.addEventListener("click", () => getNext(qid + 1));
prev.addEventListener("click", () => getNext(qid - 1));

if (qid === 0) {
    prev.style.display = "none";
    skip.style.width = "100%";
}

fetch(`api/question/${qid}`)
    .then((response) => response.json())
    .then((response) => {
        if (!response.empty()) {
            question_label.innerText = response["question"];
            question_input.setAttribute("value", response["id"]);
            const div = document.getElementsByClassName("answer-buttons")[0];
            for (const option of response.options) {
                const btn = document.createElement("btn");
                btn.classList.add("pure-button", "pure-button-primary", "answer-btn");
                btn.dataset.value = `${option.id}`;
                btn.textContent = option.answer_option;
                div.append(btn);
            }
            addListeners();
            if (response.answer !== undefined) {
                method = "PUT";
                document.querySelector(`.answer-btn[data-value="${response.answer}"]`).style.opacity = "0.5";
            }
        } else getNext(); // Resets
    });

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => {
        for (const elem of response) {
            progress.insertAdjacentHTML(
                "beforeend",
                `<div data-current="${+elem.id === qid}" data-answered="${elem.answered}">${elem.id + 1}</div>`,
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
    window.location.assign(`/questions/?qid=${q}`);
}

// I did this myself lel
Object.prototype.empty = function () {
    return Object.keys(this).length === 0;
};

NodeList.prototype.on = function (listener, event) {
    for (const node of this) {
        node.addEventListener(listener, event);
    }
};

function addListeners() {
    const buttons = document.querySelectorAll(".answer-btn");
    buttons.on("click", async (e) => {
        const body = JSON.stringify({
            question: question_input.value,
            answer: e.target.dataset.value,
        });
        const resp = await fetch("api/answer", {
            method,
            headers: { "Content-Type": "application/json" },
            body,
        });
        const res = await resp.json();
        if (res.success) getNext(qid + 1);
    });
}
