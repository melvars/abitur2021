// Pretty ugly, huh?

document.querySelector(".wrapper").style.opacity = 1;

function send(id, vote) {
    var xhp = new XMLHttpRequest();
    xhp.open("POST", "/api/vote");
    xhp.setRequestHeader("Content-type", "application/json");
    xhp.onreadystatechange = () => {
        if (xhp.readyState == 4 && xhp.status == 200) console.log(xhp.responseText);
    };
    id = parseInt(id);
    vote = parseInt(vote);
    xhp.send(JSON.stringify({ id, vote }));
}

function add(main, description) {
    var xhp = new XMLHttpRequest();
    xhp.open("POST", "/api/add");
    xhp.setRequestHeader("Content-type", "application/json");
    xhp.onreadystatechange = () => {
        if (xhp.readyState == 4 && xhp.status == 200) console.log(xhp.responseText);
    };
    xhp.send(JSON.stringify({ main, description }));
}

function initCards() {
    let newCards = document.querySelectorAll(".card:not(.removed)");
    newCards.forEach((card, index) => {
        card.style.zIndex = newCards.length - index;
        card.style.transform = "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
        card.style.opacity = (10 - index) / 10;
    });
}

function start() {
    initCards();

    let cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        let hammer = new Hammer(card);
        hammer.on("pan", (event) => {
            card.classList.add("moving");
            if (event.deltaX === 0) return;
            if (event.center.x === 0 && event.center.y === 0) return;

            const xMulti = event.deltaX * 0.03;
            const yMulti = event.deltaY / 80;
            const rotate = xMulti * yMulti;

            event.target.style.transform =
                "translate(" + event.deltaX + "px, " + event.deltaY + "px) rotate(" + rotate + "deg)";
        });

        hammer.on("panend", (event) => {
            card.classList.remove("moving");
            const moveOutWidth = document.body.clientWidth;
            const keep = Math.abs(event.deltax) < 80 || Math.abs(event.velocityX) < 0.5;
            event.target.classList.toggle("removed", !keep);

            if (keep) {
                event.target.style.transform = "";
            } else {
                event.target.style.opacity = 0;
                const endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
                const toX = event.deltaX > 0 ? endX : -endX;
                const endY = Math.abs(event.velocityY) * moveOutWidth;
                const toY = event.deltaY > 0 ? endY : -endY;
                const xMulti = event.deltaX * 0.03;
                const yMulti = event.deltaY / 80;
                const rotate = xMulti * yMulti;
                event.target.style.transform =
                    "translate(" + toX + "px, " + (toY + event.deltaY) + "px) rotate(" + rotate + "deg)";
                send(event.target.getAttribute("data-id"), toX > 0 ? 1 : -1);
                initCards();
            }
        });
    });
}

function skipCard() {
    const card = document.querySelectorAll(".card:not(.removed)")[0];
    const moveOutWidth = document.body.clientWidth * 1.5;

    if (!card) return false;

    card.classList.add("removed");
    card.style.transform = "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
    initCards();
    event.preventDefault();
}

function jumpTo(event) {
    document.getElementById("sebastian").style.display = "none";
    const cards = document.querySelectorAll(".card:not(.removed)");
    let index = 0;
    while (cards[index].getAttribute("data-id") != event.target.getAttribute("data-id")) {
        index++;
        skipCard();
    }
}

function toggleOverview() {
    const strange = document.getElementById("sebastian");
    const off = strange.style.display == "none";
    strange.style.display = off ? "block" : "none";
    if (!off) return;
    const overview_list = document.getElementById("overview");
    overview_list.innerHTML = "";
    const cards = document.querySelectorAll(".card:not(.removed)");
    cards.forEach((element) => {
        const li = document.createElement("li");
        li.setAttribute("data-id", element.getAttribute("data-id"));
        li.textContent = `${element.querySelectorAll("h1")[1].innerText} - ${element.querySelector("h2").innerText} (${
            element.querySelectorAll("h2")[1].innerText
        })`;
        li.addEventListener("click", jumpTo);
        overview_list.appendChild(li);
    });
}

function createButtonListener(yay) {
    return function (event) {
        const card = document.querySelectorAll(".card:not(.removed)")[0];
        const moveOutWidth = document.body.clientWidth * 1.5;

        if (!card) return false;

        card.classList.add("removed");

        if (yay) {
            card.style.transform = "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
        } else {
            card.style.transform = "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
        }

        send(card.getAttribute("data-id"), yay ? 1 : -1);
        initCards();
        event.preventDefault();
    };
}

var xhp = new XMLHttpRequest();
xhp.open("GET", "/api/list");
xhp.onreadystatechange = () => {
    if (xhp.readyState == 4 && xhp.status == 200) {
        let list = JSON.parse(xhp.responseText);
        const cards_element = document.querySelector(".cards");
        list.forEach((element) => {
            const card = document.createElement("div");
            card.setAttribute("class", "card");
            card.setAttribute("data-id", element["id"]);
            const h1 = document.createElement("h1");
            h1.innerText = "Thema #" + element["id"];
            const hr1 = document.createElement("hr");
            hr1.style.marginTop = "16px";
            const h2 = document.createElement("h1");
            h2.innerText = element["main"];
            h2.style.marginTop = "16px";
            const h3 = document.createElement("h2");
            h3.innerText = element["description"];
            const hr2 = document.createElement("hr");
            hr2.style.marginTop = "16px";
            hr2.style.marginBottom = "16px";
            const h4 = document.createElement("h2");
            h4.innerText = "Votes: " + element["votes"];
            card.appendChild(h1);
            card.appendChild(hr1);
            card.appendChild(h2);
            card.appendChild(h3);
            card.appendChild(hr2);
            card.appendChild(h4);
            cards_element.appendChild(card);
        });
        start();
    }
};
xhp.send();

var yayListener = createButtonListener(true);
var nayListener = createButtonListener(false);
document.getElementById("yay").addEventListener("click", yayListener);
document.getElementById("hmm").addEventListener("click", skipCard);
document.getElementById("nay").addEventListener("click", nayListener);

document.getElementById("add").addEventListener("click", () => {
    const main = prompt("Was ist das Hauptthema (erste Teil)?", "ABI 2021");
    const secondary = prompt("Was ist der zweite Teil?", "Wir sind super toll");
    if (main && secondary) add(main, secondary);
});

document.getElementById("idc").addEventListener("click", () => {
    const wrapper = document.querySelector(".cards");
    console.log(wrapper.children.length);
    for (var i = wrapper.children.length; i >= 0; i--) wrapper.appendChild(wrapper.children[(Math.random() * i) | 0]);
    initCards();
});

document.getElementById("aah").addEventListener("click", () => {
    const elements = document.getElementsByClassName("removed");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("removed");
    }
    initCards();
});

document.getElementById("all").addEventListener("click", toggleOverview);
document.getElementById("go").addEventListener("click", toggleOverview);
