const dropdown = document.getElementById("author");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Author auswählen...</option>');

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
                }${elem["owner"] ? '<span data-id="' + elem["id"] + '">[Löschen]</span></li>' : ""}`,
            );

        const span = document.querySelector(`li span[data-id="${elem["id"]}"]`);
        if (span) span.addEventListener("click", (event) => {
            fetch("api/delete/" + event.target.getAttribute("data-id"), { method: "DELETE" })
                .then((response) => response.text())
                .then((response) => {
                    if (response == "ok") event.target.parentNode.remove();
                });
        });
    });
}

fetch("/auth/api/list?class=all")
    .then((response) => response.json())
    .then((response) => appendOption(response));

fetch("api/list")
    .then((response) => response.json())
    .then((response) => appendQuote(response));

const classes = ["TGI13.1", "TGI13.2", "TGM13.1", "TGM13.2", "TGTM13.1"];
classes.forEach((clazz) => {
    document.getElementById("open_" + clazz).addEventListener("click", () => {
        const ul = document.getElementById(clazz);
        if (ul.style.display === "none") ul.style.display = "block";
        else ul.style.display = "none";
    });
});
