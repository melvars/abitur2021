const dropdown = document.getElementById("answer");
const question_input = document.getElementById("question");
const question_label = document.getElementById("question_label");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Schüler/in auswählen...</option>');

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

fetch("/auth/api/list")
    .then((response) => response.json())
    .then((response) => appendOption(response));

fetch("/poll/api/get")
    .then((response) => response.json())
    .then((response) => {
        question_label.innerText = response["question"];
        question_input.setAttribute("value", response["id"]);
    });
