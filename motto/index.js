const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(__dirname + "/public"));

app.get("/api/list", (req, res) => {
  fs.readFile("list.txt", "utf8", (err, data) => {
    res.send(data);
  });
});

app.post("/api/vote", (req, res) => {
  console.log(req.body.text, req.body.vote);
  res.send("ok");
});

app.listen(3000);
