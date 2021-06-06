const dropdown = document.getElementById("author");
const classes = ["TGM13.1", "TGM13.2", "TGTM13", "TGI13.1", "TGI13.2", "teacher"];

dropdown.insertAdjacentHTML(
    "beforeend",
    '<option disabled value="" selected="true" disabled>Autor auswählen...</option>',
);
dropdown.insertAdjacentHTML("beforeend", `<option disabled value="">--${classes[0]}--</option>`);

function appendOption(response) {
    response.forEach((elem, i) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            (response[i - 1 < 0 ? 0 : i - 1]["class_id"] !== elem["class_id"]
                ? `<option disabled value="">--${classes[elem["class_id"] - 1]}--</option>`
                : "") +
                `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] + " " : ""}${
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
                `<li><span class="text">${elem["name"]} ${elem["middlename"] ? elem["middlename"] + " " : ""}${
                    elem["surname"]
                }: ${elem["quote"]}</span>${
                    elem["owner"] ? ' <span class="delete-btn" data-id="' + elem["id"] + '"></span></li>' : ""
                }`,
            );

        const span = document.querySelector(`li span[data-id="${elem["id"]}"]`);
        if (span)
            span.addEventListener("click", (event) => {
                if (!confirm("Bist du dir sicher, dass du das Zitat löschen willst?")) return;
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

classes.forEach((clazz) => {
    document.getElementById("open_" + clazz).addEventListener("click", () => {
        const ul = document.getElementById(clazz);
        if (ul.style.display === "none") ul.style.display = "block";
        else ul.style.display = "none";
    });
});
