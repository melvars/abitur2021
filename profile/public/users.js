function addUser(user) {
    const div = document.createElement("div");
    // Idk what to do lel
}

fetch("api/users")
    .then((response) => response.json())
    .then((response) => response.forEach(addUser))
    .catch(console.error);
