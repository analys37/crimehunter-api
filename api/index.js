const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("crimehunter.my.id 🚀");
});

module.exports = app;
