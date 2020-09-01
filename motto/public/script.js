document.querySelector(".wrapper").style.opacity = 1;

function send(text, vote) {
  var xhp = new XMLHttpRequest();
  xhp.open("POST", "/api/vote");
  xhp.setRequestHeader("Content-type", "application/json");
  xhp.onreadystatechange = () => {
    if (xhp.readyState == 4 && xhp.status == 200) console.log(xhp.responseText);
  };
  xhp.send(JSON.stringify({ text, vote }));
}

function initCards() {
  let newCards = document.querySelectorAll(".card:not(.removed)");
  newCards.forEach((card, index) => {
    card.style.zIndex = newCards.length - index;
    card.style.transform =
      "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
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
        "translate(" +
        event.deltaX +
        "px, " +
        event.deltaY +
        "px) rotate(" +
        rotate +
        "deg)";
    });

    hammer.on("panend", (event) => {
      card.classList.remove("moving");
      const moveOutWidth = document.body.clientWidth;
      const keep =
        Math.abs(event.deltax) < 80 || Math.abs(event.velocityX) < 0.5;
      event.target.classList.toggle("removed", !keep);

      if (keep) {
        event.target.style.transform = "";
      } else {
        event.target.style.opacity = 0;
        const endX = Math.max(
          Math.abs(event.velocityX) * moveOutWidth,
          moveOutWidth
        );
        const toX = event.deltaX > 0 ? endX : -endX;
        const endY = Math.abs(event.velocityY) * moveOutWidth;
        var toY = event.deltaY > 0 ? endY : -endY;
        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;
        event.target.style.transform =
          "translate(" +
          toX +
          "px, " +
          (toY + event.deltaY) +
          "px) rotate(" +
          rotate +
          "deg)";
        send(event.target.innerText, toX > 0 ? 1 : -1);
        initCards();
      }
    });
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var xhp = new XMLHttpRequest();
xhp.open("GET", "/api/list");
xhp.onreadystatechange = () => {
  if (xhp.readyState == 4 && xhp.status == 200) {
    let list = xhp.responseText.split("\n");
    shuffleArray(list);
    list = list.slice(0, 100);
    const cards_element = document.querySelector(".cards");
    list.forEach((element) => {
      const card = document.createElement("div");
      card.setAttribute("class", "card");
      const h1 = document.createElement("h1");
      h1.innerText = "ABI 2021";
      const h2 = document.createElement("h2");
      h2.innerText = element;
      card.appendChild(h1);
      card.appendChild(h2);
      cards_element.appendChild(card);
    });
    start();
  }
};
xhp.send();
