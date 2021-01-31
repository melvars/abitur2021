const pullButton = document.getElementById("pull-button");
const pullResponse = document.getElementById("pull-response");

const queryForm = document.getElementById("query-form");
const queryResponse = document.getElementById("query-response");

pullButton.addEventListener("click", async e => {
    const resp = await fetch("api/pull");
    const res = await resp.json();
    if (res.success) {
        pullResponse.textContent = res.stdout;
    } else {
        console.log(res.error);
        pullResponse.textContent = res.stderr;//.replace(/\n/g, "\n\r");
    }
});

queryForm.addEventListener("submit", async e => {
    e.preventDefault();
    const textarea = queryForm.querySelector("textarea");
    const body = JSON.stringify({ query: textarea.value.trim() });
    const resp = await fetch("api/query", {
        method: "POST", body, headers: { "Content-Type": "application/json" }
    });
    const res = await resp.json();
    while (queryResponse.children.length > 0) queryResponse.removeChild(queryResponse.children[0]);
    if (res.success && res.response.length > 0) {
        const keys = Object.keys(res.response[0]);
        const head = document.createElement("thead");
        for (const key of keys) {
            const th = document.createElement("th");
            th.textContent = key;
            head.append(th);
        }
        for (const row of res.response) {
            const tr = document.createElement("tr");
            for (const colI in row) {
                if (!row.hasOwnProperty(colI)) continue;
                const td = document.createElement("td");
                td.textContent = row[colI];
                tr.append(td);
            }
            queryResponse.append(tr);
        }
        queryResponse.append(head);
    } else if (!res.success && res.message) {
        const span = document.createElement("span");
        span.textContent = JSON.stringify(res.message);
        queryResponse.append(span);
    }
});