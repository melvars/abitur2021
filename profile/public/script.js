const fs = document.querySelector("fieldset");
const form = document.querySelector("form");
let init = true;

const popup = document.querySelector(".popup");
const popupImage = document.querySelector("#popup-img");
const cropper = new Cropper(popupImage, { // ration 2/3
    dragMode: 'move',
    aspectRatio: 2 / 3,
    autoCropArea: 0.65,
    restore: false,
    guides: false,
    center: false,
    highlight: false,
    cropBoxMovable: false,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
});

function updateHeading(user) {
    document.getElementById("username").textContent = `Steckbrief: ${user.name} ${user.middlename || ""} ${user.surname}`;
}

function appendQuestions(question) {
    const div = document.createElement("div");

    const label = document.createElement("label");
    label.for = "id_" + question.id;
    label.textContent = question.question;
    div.appendChild(label);

    if (question.type === "file" && question.answer) {
        const img = document.createElement("img");
        img.src = "uploads/" + question.answer;
        img.alt = "Image";
        div.appendChild(img);
    }

    const field = document.createElement("input");
    field.id = "id_" + question.id;
    field.name = question.id;
    if (question.answer !== undefined) init = false;
    field.value = question.answer || "";
    field.placeholder = question.question;
    field.type = question.type;
    if (question.type === "file") {
        field.accept = "image/*";
        field.addEventListener("input", e => {
            const file = e.target.files[0];
            popupImage.file = file;
            const reader = new FileReader();
            reader.onload = (function (aImg) {
                return function (e) {
                    aImg.src = e.target.result;
                };
            })(popupImage);
            reader.readAsDataURL(file);
            popupImage.style.display = "block !important";
            console.log(cropper);
        });
    }

    div.appendChild(field);
    fs.insertBefore(div, fs.querySelector("button"));
}

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const url = init ? "api/add" : "api/update";
    const method = init ? "POST" : "PUT";

    const inputs = form.querySelectorAll("input");
    const body = new FormData();
    for (const input of inputs) {
        if (input.type !== "file") body.append(input.name, input.value);
        else body.append(input.name, input.files[0] ?? "dbg-image");
    }

    const resp = await fetch(url, { method, body });
    const res = await resp.text();
    if (res !== "ok") alert("AHHHH");
    else location.reload();
});

fetch("/auth/api/self")
    .then((response) => response.json())
    .then(updateHeading)
    .catch(console.error);

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => response.forEach(appendQuestions))
    .catch(console.error);
