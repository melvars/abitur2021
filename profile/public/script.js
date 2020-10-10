const fs = document.querySelector("fieldset");
const form = document.querySelector("form");
let init = true;

function updateHeading(user) {
    document.getElementById("username").textContent = `${user.name} ${user.surname}`;
}

function appendQuestions(question) {
    const div = document.createElement("div");

    const label = document.createElement("label");
    label.for = "id_" + question.id;
    label.textContent = question.question;

    const field = document.createElement("input");
    field.id = "id_" + question.id;
    field.name = question.id;
    if (question.answer !== undefined) init = false;
    field.value = question.answer;
    field.placeholder = question.question;

    div.append(label, field);
    fs.insertBefore(div, fs.querySelector("button"));
}

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const url = init ? "api/add" : "api/update";
    const method = init ? "POST" : "PUT";

    const inputs = form.querySelectorAll("input");
    const body = {};
    for (const input of inputs) body[input.name] = input.value;

    const resp = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        method,
        body: JSON.stringify(body),
    });
    const res = await resp.text();
    if (res !== "ok") alert("AHHHH");
});

fetch("api/user")
    .then((response) => response.json())
    .then(updateHeading)
    .catch(console.error);

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => response.forEach(appendQuestions))
    .catch(console.error);
