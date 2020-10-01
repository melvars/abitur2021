const dropdown = document.getElementById("author");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Author auswählen...</option>');

function append(response) {
    response.forEach((elem) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="${elem["id"]}">${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${
                elem["surname"]
            }</option>`
        );
    });
}

// TODO: Add api list endpoint
fetch("/auth/api/list")
    .then((response) => response.json())
    .then((response) => append(response));
