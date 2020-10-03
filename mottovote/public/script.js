const maxVotes = 3;
get();

async function get() {
    const resp = await fetch("api/list");
    const mottos = await resp.json();

    for (const motto of mottos) {
        const row = document.createElement("div");
        const id = motto.id;

        for (let i = 0; i < maxVotes; i++) {
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.value = id;
            cb.checked = motto.votes && motto.votes-- > 0;
            row.append(cb);
        }

        const text = document.createElement("span");
        text.textContent = `${motto.name} ${motto.description ? "-" : ""} ${motto.description}`;

        row.append(text);
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
            if (checkedSiblings.length > maxVotes) evt.target.checked = false;
        });
    });

    window.voteButton.addEventListener("click", async () => {
        const checked = document.querySelectorAll("input[type=checkbox]:checked");
        if (checked.length > maxVotes) return; // Shouldn't be necessary
        const req = {};
        for (const box of checked) req[box.value] = box.value in req ? req[box.value] + 1 : 1; // Amount of votes
        const resp = await fetch("api/vote", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });
        const res = await resp.text();
        if (res === "ok") location.reload();
        else alert(res);
    });
}
