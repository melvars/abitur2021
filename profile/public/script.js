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
    div.appendChild(label);

    if (question.type === "file" && question.answer) {
        const img = document.createElement("img");
        img.src = "uploads/" + question.answer;
        img.alt = "Image";
        div.appendChild(img);
    }

    const field = document.createElement("input");
    field.id = "id_" + question.id;
    field.name = question.id;
    if (question.answer !== undefined) init = false;
    field.value = question.answer || "";
    field.placeholder = question.question;
    field.type = question.type;
    if (question.type === "file") field.accept = "image/*";

    div.appendChild(field);
    fs.insertBefore(div, fs.querySelector("button"));
}

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const url = init ? "api/add" : "api/update";
    const method = init ? "POST" : "PUT";

    const inputs = form.querySelectorAll("input");
    const body = new FormData();
    for (const input of inputs) {
        if (input.type !== "file") body.append(input.name, input.value);
        else body.append(input.name, input.files[0] ?? "dbg-image");
    }

    const resp = await fetch(url, { method, body });
    const res = await resp.text();
    if (res !== "ok") alert("AHHHH");
    else location.reload();
});

fetch("api/user")
    .then((response) => response.json())
    .then(updateHeading)
    .catch(console.error);

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => response.forEach(appendQuestions))
    .catch(console.error);
