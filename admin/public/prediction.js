const list = document.getElementById("list");

fetch("api/prediction")
    .then((r) => r.json())
    .then((r) => {
        r.forEach((d) => {
            const elem = document.createElement("li");
            elem.innerText = `${d.uname} ${d.umid || ""} ${d.usur}: ${d.tname} ${d.tmid || ""} ${d.tsur}`;
            list.appendChild(elem);
        });
    });
