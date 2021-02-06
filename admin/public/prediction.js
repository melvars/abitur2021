const list = document.getElementById("list");

fetch("api/prediction")
    .then((r) => r.json())
    .then((r) => {
        r.forEach((d) => {
            const teacherList = list.querySelector(`div[data-teacher="${d.tid}"]`);
            if (teacherList) {
                const ul = teacherList.querySelector("ul");
                addLI(d, ul);
            } else {
                const div = document.createElement("div");
                div.dataset.teacher = `${d.tid}`;
                const h3 = document.createElement("h3");
                const a = document.createElement("a");
                a.href = `mailto:${san(d.tname)}.${san(d.tsur)}@rbs-ulm.de`;
                a.textContent = `${d.tname} ${d.tsur}`;
                h3.append(a);
                const ul = document.createElement("ul");
                addLI(d, ul);
                div.append(h3, ul);
                list.appendChild(div);
            }
        });
    });

function addLI(d, ul) {
    const li = document.createElement("li");
    li.textContent = `${d.uname} ${d.umid || ""} ${d.usur} (${d.class})`;
    ul.appendChild(li);
}

const san = (name) =>
    name.toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ö/g, "oe");
