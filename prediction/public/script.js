const dropdown = document.getElementById("prediction");
const submit = document.querySelector('button[type="submit"]');
let method = "POST";

dropdown.insertAdjacentHTML(
    "beforeend",
    '<option disabled value="" selected="true" disabled>Lehrer auswählen...</option>',
);

function appendOption(response) {
    response.forEach((elem, i) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] + " " : ""}${elem["surname"]}</option>`,
        );
    });
}

function selectOption(response) {
    if (Object.keys(response).length > 0) {
        dropdown.value = response.teacher_id;
        method = "PUT";
    }
}

fetch("/auth/api/list?class=teacher")
    .then((response) => response.json())
    .then((response) => appendOption(response))
    .then(() => fetch("api/get"))
    .then((response) => response.json())
    .then(selectOption);

submit.addEventListener("click", async (e) => {
    const teacher = dropdown.value;
    const body = JSON.stringify({ teacher });
    const resp = await fetch("api/set", { method, body, headers: { "Content-Type": "application/json" } });
    const res = await resp.json();
    if (res.success) method = "PUT";
});