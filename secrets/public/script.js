const list = document.getElementById("list");

function appendsecret(response) {
    response.forEach((elem) => {
        list.insertAdjacentHTML(
            "beforeend",
            `<li><span class="text">${elem["secret"]}</span>${
                elem["owner"] ? ' <span class="delete-btn" data-id="' + elem["id"] + '"></span></li><hr>' : ""
            }`,
        );

        const span = document.querySelector(`li span[data-id="${elem["id"]}"]`);
        if (span)
            span.addEventListener("click", (event) => {
                if (!confirm("Bist du dir sicher, dass du das löschen willst?")) return;
                fetch("api/delete/" + event.target.getAttribute("data-id"), { method: "DELETE" })
                    .then((response) => response.text())
                    .then((response) => {
                        if (response == "ok") event.target.parentNode.remove();
                    });
            });
    });
}

fetch("api/list")
    .then((response) => response.json())
    .then((response) => appendsecret(response));
