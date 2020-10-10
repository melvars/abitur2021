const fs = document.querySelector("fieldset");

function appendQuestions(question) {
    const field = document.createElement("input");
    field.name = question.id;
    field.value = question.answer ?? "";
    field.placeholder = question.question;
    fs.insertBefore(field, fs.querySelector("button"));
}

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => response.forEach(appendQuestions))
    .catch(console.error);
