const dropdown = document.getElementById("author");
const quotes = document.getElementById("quotes");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Author auswählen...</option>');

function appendOption(response) {
    response.forEach((elem) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${
                elem["surname"]
            }</option>`
        );
    });
}

function appendQuote(response) {
    response.forEach((elem) => {
        quotes.insertAdjacentHTML(
            "beforeend",
            `<li>${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${elem["surname"]}: ${
                elem["quote"]
            }</li>`
        );
    });
}

fetch("/auth/api/list")
    .then((response) => response.json())
    .then((response) => appendOption(response));

fetch("/quotes/api/list")
    .then((response) => response.json())
    .then((response) => appendQuote(response));
