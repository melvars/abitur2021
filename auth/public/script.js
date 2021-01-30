loggedIn();

async function loggedIn() {
    const resp = await fetch("api/status");
    const res = await resp.json();
    if (res.loggedIn && !window.location.pathname.endsWith("change.html")) window.location.replace("/");
    else if (!res.loggedIn && window.location.pathname.endsWith("change.html")) window.location.replace("/");
}

const form = document.querySelector("form");
form.addEventListener("submit", async e => {
    e.preventDefault();
    const method = e.target.method;
    const url = e.target.action;
    const rawBody = {};
    for (const input of form.querySelectorAll("input"))
        rawBody[input.name] = input.value;
    const body = JSON.stringify(rawBody);
    const resp = await fetch(url, { method, body, headers: { "Content-Type": "application/json" } });
    const res = await resp.json();
    if (!res.success) alert(res.message);
    else {
        const ref = new URL(location.href).searchParams.get("ref");
        window.location.replace(ref);
    }
});