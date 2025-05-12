import bodyParser from "body-parser";
import type { Express } from "express";
import express from "express";
import indexRouter from "./routes/index.js";

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", indexRouter);

// Catch-all route for 404 Not Found errors
app.use((_req, res) => {
  res.status(404).json({ error: "Page not found" });
});

export default app;
