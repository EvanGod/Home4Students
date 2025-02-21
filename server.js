const app = require("./src/app");

app.get("/", (req, res) => {
  res.send("Hola desde Vercel");
});

module.exports = app;
