fetch("/auth/api/status")
    .then((response) => response.json())
    .then((response) => {
        console.log(response);
        const first = document.querySelectorAll("a")[0];
        const second = document.querySelectorAll("a")[1];
        const third = document.querySelectorAll("a")[2];
        const fourth = document.querySelectorAll("a")[3];

        if (!response.admin) third.style.display = "none";

        if (response.loggedIn) {
            first.href = "/auth/change.html";
            first.innerText = "Passwort ändern";
            second.href = "/auth/api/logout";
            second.innerText = "Logout";
            if (response.admin) {
                third.href = "/admin";
                third.innerText = "Admin";
            }
            if (response.superAdmin) {
                fourth.href = "/super";
                fourth.textContent = "Super-Duper-Admin-Spaß";
            }
        } else {
            document.querySelectorAll("div.pure-menu")[0].style.display = "none";
        }
    });
