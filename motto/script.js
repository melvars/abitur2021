document.querySelector(".wrapper").style.opacity = 1;

let cards = document.querySelectorAll(".card");
cards.forEach((card, index) => {
  card.style.zIndex = cards.length - index;
  card.style.transform =
    "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
  card.style.opacity = (10 - index) / 10;

  let hammer = new Hammer(card);
  hammer.on("pan", (event) => {
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
    const moveOutWidth = document.body.clientWidth;
    const keep = Math.abs(event.deltax) < 80 || Math.abs(event.velocityX) < 0.5;
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
    }
  });
});
