const dropdown = document.getElementById("answer");
const question_input = document.getElementById("question");
const question_label = document.getElementById("question_label");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Schüler/in auswählen...</option>');

function appendOption(response) {
    response.forEach((elem) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${
                elem["surname"]
            }</option>`,
        );
    });
}

function appendQuote(response) {
    response.forEach((elem) => {
        document
            .getElementById(elem["class"])
            .insertAdjacentHTML(
                "beforeend",
                `<li>${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${elem["surname"]}: ${
                    elem["quote"]
                }</li>`,
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
