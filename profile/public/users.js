function addUser(user) {
    const li = document.createElement("a");
    li.classList.add("pure-menu-link");
    li.textContent = `${user.name} ${user.middlename || ""} ${user.surname}`;
    li.href = "./user.html?uid=" + user.id;
    if (user.class_id < 6) document.getElementById("class_" + user.class_id).appendChild(li);
}

fetch("/auth/api/list?class=all")
    .then((response) => response.json())
    .then((response) => response.forEach(addUser));

document.querySelectorAll("b").forEach((elem) => {
    const next = elem.nextElementSibling;
    next.style.display = "none";
    elem.addEventListener("click", () => {
        console.log(elem);
        next.style.display = next.style.display == "none" ? "block" : "none";
    });
});
