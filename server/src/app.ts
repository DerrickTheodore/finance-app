import logger from "@myfi/infra/logger";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"; // Import cookie-parser
import express from "express";
import { pinoHttp } from "pino-http"; // Import stdSerializers
import { attachDb } from "./middleware/dbMiddleware.js"; // Import attachDb
import routes from "./routes/index.js";

const app: express.Express = express();
const parser = bodyParser;

app.use(parser.urlencoded({ extended: true })); // Changed to extended: true
app.use(parser.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(pinoHttp({ logger }));
app.use((_, res, next) => {
  const originalSend = res.send;
  res.send = function (body?: any) {
    logger.info({ data: JSON.parse(body) }, "Response sent");
    return originalSend.call(this, body);
  };
  next();
});
app.use(attachDb); // Use attachDb middleware

app.use("/api", routes);

// Catch-all route for 404 Not Found errors
app.use((_req, res) => {
  res.status(404).json({ error: "Page not found" });
});

export default app;
