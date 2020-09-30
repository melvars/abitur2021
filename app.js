require("dotenv").config();
const express = require("express");

const motto = require("./motto");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/motto", motto);

app.listen(5005, () => console.log("Server started on http://localhost:5005"));
