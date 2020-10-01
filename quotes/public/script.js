const dropdown = document.getElementById("author");

dropdown.insertAdjacentHTML("beforeend", '<option selected="true" disabled>Author auswählen...</option>');

function append(response) {
    response.forEach((elem) => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<option ${elem["id"]}>${elem["name"]} ${elem["middlename"] ? elem["middlename"] : " "}${
                elem["surname"]
            }</option>`
        );
    });
}

// TODO: Add api list endpoint
// fetch("/auth/api/list")
//     .then((response) => response.json())
//     .then((response) => append(response));

const exampleJson = [
    { id: 1, name: "Lars", middlename: null, surname: "Baum" },
    { id: 2, name: "Marvin", middlename: null, surname: "Giraffe" },
    { id: 3, name: "Dominik", middlename: null, surname: "Apfel" },
    { id: 4, name: "Daniel", middlename: null, surname: "Torte" },
];

append(exampleJson);
