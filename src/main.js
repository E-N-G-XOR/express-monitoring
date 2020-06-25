const makeApiMiddleware = require("api-express-exporter");
const express = require("express");
const app = express();
const url = require('url');
const proxy = require('express-http-proxy');

app.use(makeApiMiddleware());

const getPath = req => require('url').parse(req.url).path;
const createProxy = ({hostname = 'localhost', port = 9991, path = ''}) =>
+  proxy(`${hostname}:${port}`, { proxyReqPathResolver: req => `${path}` });

app.use('/metrics', createProxy({port: 9991, path: '/metrics'})); // http://localhost/api/foo -> http://localhost:3000/api/foo 
app.use("/api/sub", require("./sub_module"));

app.get("/api", (req, res) => {
  res.status(200).send("Api Works.");
});
app.get("/api/fast/", (req, res) => {
  res.status(200).send("Fast response!");
});
app.get("/api/slow", (req, res) => {
  setTimeout(() => {
    res.status(200).send("Slow response...");
  }, 1000);
});

app.get("/api/error", (req, res, next) => {
  try {
    throw new Error("Something broke...");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/list/:listId", (req, res, next) => {
  res.status(200).send(`Retrieved list ${req.params.listId}`);
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
