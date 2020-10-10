const type = getParameterByName("type");
const dropdown = document.getElementById("answer");
const question_input = document.getElementById("question");
const question_label = document.getElementById("question_label");

if (!["teacher", "pupil"].includes(type)) window.location.href = "/";

dropdown.insertAdjacentHTML(
    "beforeend",
    '<option selected="true" disabled>' + (type == "teacher" ? "Lehrer" : "Schüler") + "/in auswählen...</option>",
);
document.querySelector("legend").innerText = type == "teacher" ? "Lehrer-Ranking" : "Schüler-Ranking";
document.querySelector("p").innerText = "Welche/r " + (type == "teacher" ? "Lehrer/in" : "Schüler/in") + "...";
document.querySelector("form").setAttribute("action", "api/answer?type=" + type);

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

fetch("/auth/api/list" + (type == "teacher" ? "?class=teacher" : ""))
    .then((response) => response.json())
    .then((response) => appendOption(response));

fetch("/poll/api/get?type=" + type)
    .then(async (response) => {
        let json;
        try {
            return await response.json();
        } catch (e) {
            document.querySelector("p").innerText = "";
            question_label.innerText = "Du hast bereits alle Fragen beantwortet.";
            document.querySelectorAll("label")[1].innerText = "Danke!";
            document.querySelector("select").style.display = "none";
            document.querySelector("button").style.display = "none";
            throw "Oh nein, alle beantwortet!"; // :^)
        }
    })
    .then((response) => {
        question_label.innerText = response["question"];
        question_input.setAttribute("value", response["id"]);
    });

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
