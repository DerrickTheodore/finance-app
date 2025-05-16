import * as bodyParser from "body-parser";
import * as express from "express";
import { pino } from "pino";
import { pinoHttp } from "pino-http";
import indexRouter from "./routes/index.js";

const httpLogger = pinoHttp({
  logger: pino(
    pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname,method",
      },
    })
  ),
});

const app: express.Express = express.default();
const parser = bodyParser.default;

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(httpLogger);

app.use("/api", indexRouter);

// Catch-all route for 404 Not Found errors
app.use((_req, res) => {
  res.status(404).json({ error: "Page not found" });
});

export default app;
