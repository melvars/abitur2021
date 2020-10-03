loggedIn();

async function loggedIn() {
    const resp = await fetch("api/status");
    if (!(await resp.json())["loggedIn"]) location.redirect("/");
}
