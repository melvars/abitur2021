function addUser(user) {
    const li = document.createElement("li");
    li.textContent = `${user.name} ${user.middlename || ""} ${user.surname}`;
    li.addEventListener("click", () => window.location.assign(`./user.html?uid=${user.id}`));
    document.getElementById("class_" + user.class_id).appendChild(li);
}

fetch("/auth/api/list?class=all")
    .then((response) => response.json())
    .then((response) => response.forEach(addUser));
