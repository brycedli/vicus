const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));

// Route handlers for dedicated HTML files
app.get("/text", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "text.html"));
});

app.get("/logo", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "logo.html"));
});

app.get("/experimental", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "experimental.html"));
});

app.get("/ascii", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ascii.html"));
});

app.get("/matcap", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "matcap.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "logo.html"));
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
  console.log("Available shader presets:");
  console.log("- http://localhost:3000/text");
  console.log("- http://localhost:3000/logo");
  console.log("- http://localhost:3000/experimental");
  console.log("- http://localhost:3000/ascii");
  console.log("- http://localhost:3000/matcap");
});