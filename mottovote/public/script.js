get();

async function get() {
    const resp = await fetch("api/list");
    const mottos = await resp.json();

    for (const motto of mottos) {
        const row = document.createElement("div");
        const id = motto.id;

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = "motto" + id;
        cb.name = id;

        const label = document.createElement("label");
        label.for = "motto" + id;
        label.textContent = `${motto.name} ${motto.description ? "-" : ""} ${motto.description}`

        row.append(cb, label);
        window.vote.appendChild(row);
    }
    addListeners();
}

function addListeners() {
    // Only allow 3 votes
    const boxes = document.querySelectorAll("input[type=checkbox]");
    boxes.forEach((box) => {
        box.addEventListener("change", (evt) => {
            const checkedSiblings = document.querySelectorAll("input[type=checkbox]:checked");
            if (checkedSiblings.length > 3) evt.target.checked = false;
        });
    });

    window.voteButton.addEventListener("click", async () => {
        const checked = document.querySelectorAll("input[type=checkbox]:checked");
        if (checked.length !== 3) return;
        const req = {};
        for (const box of checked) req[box.name] = 1; // Amount of votes
        const resp = await fetch("api/vote", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });
        console.log(await resp.text());

    });
}