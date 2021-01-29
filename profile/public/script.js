const fs = document.querySelector("fieldset");
const form = document.querySelector("form");
let init = true;
let imageInit = true;
let imageID = -1;

const popup = document.querySelector(".popup");
const popupImage = document.querySelector("#popup-img");
const saveBtn = document.querySelector("#save-btn");
const slider = document.querySelector("#rotation-slider");
const controlButtons = document.querySelectorAll(".control-btns button");
let cropper = undefined;

const crop = () => {
    cropper = new Cropper(document.getElementById("popup-img"), {
        // Consider dataset id
        //dragMode: "move",
        aspectRatio: 10 / 13,
        //autoCropArea: 0.65,
        //restore: false,
        //guides: false,
        //center: false,
        //highlight: false,
        //cropBoxMovable: false,
        //cropBoxResizable: false,
        //toggleDragModeOnDblclick: false,
    });
};

NodeList.prototype.on = function (listener, event) {
    for (const node of this) {
        node.addEventListener(listener, event);
    }
};

function updateHeading(user) {
    document.getElementById("username").textContent = `Steckbrief: ${user.name} ${user.middlename || ""} ${
        user.surname
    }`;
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
        imageInit = false;
    }

    const field = document.createElement("input");
    field.id = "id_" + question.id;
    field.name = question.id;
    if (question.answer !== undefined) init = false;
    field.value = question.answer || "";
    field.placeholder = question.question;
    field.type = question.type;
    field.maxLength = 100;
    if (question.type === "file") {
        imageID = question.id;
        field.accept = "image/*";
        field.addEventListener("input", (e) => {
            const file = e.target.files[0];
            popupImage.file = file;
            const reader = new FileReader();
            reader.addEventListener("load", (e) => {
                popupImage.src = e.target.result;
                popup.style.display = "block";
                crop();
            });
            reader.readAsDataURL(file);
        });
    }

    div.appendChild(field);
    fs.insertBefore(div, fs.querySelector("button"));
}

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const method = init ? "POST" : "PUT";

    const inputs = form.querySelectorAll("input");
    const rawBody = {};
    for (const input of inputs) {
        if (input.type !== "file") rawBody[input.name] = input.value;
    }
    const body = JSON.stringify(rawBody);

    const resp = await fetch("api/answer", { method, body, headers: { "Content-Type": "application/json" } });
    const res = await resp.json();
    if (!res.success) {
        alert("An error occurred");
    } else {
        init = false;
        alert("Okidoki, danke!");
    }
});

saveBtn.addEventListener("click", (e) => {
    cropper.getCroppedCanvas().toBlob(async (blob) => {
        const url = "api/answerImage";
        const method = imageInit ? "POST" : "PUT";
        const body = new FormData();
        if (imageID === -1) {
            return;
        }
        body.append(imageID, blob);
        const resp = await fetch(url, { method, body });
        const res = await resp.json();
        if (!res.success) {
            alert("An error occurred");
        } else {
            imageInit = false;
            popup.style.display = "none";
            cropper.destroy();
            document.querySelectorAll("img").forEach((elem) => {
                if (elem.src.startsWith("http")) elem.src += "#" + new Date().getTime();
            });
        }
    }, "image/jpeg");
});

slider.addEventListener("input", (e) => {
    cropper.rotateTo(-e.target.value);
});

controlButtons.on("click", (e) => {
    if (e.target.dataset.rot === "true") cropper.rotate(+e.target.dataset.value);
    else cropper.rotateTo(+e.target.dataset.value);
});

fetch("/auth/api/self")
    .then((response) => response.json())
    .then(updateHeading)
    .catch(console.error);

fetch("api/questions")
    .then((response) => response.json())
    .then((response) => response.forEach(appendQuestions))
    .catch(console.error);
