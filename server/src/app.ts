import logger from "@myfi/infra/logger";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"; // Import cookie-parser
import express from "express";
import { pinoHttp, stdSerializers } from "pino-http"; // Import stdSerializers
import { attachDb } from "./middleware/dbMiddleware.js"; // Import attachDb
import routes from "./routes/index.js";
// import { protect } from './middleware/authMiddleware.js'; // Import protect middleware

const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: stdSerializers.req,
    res: (res: any) => {
      const { statusCode } = res;
      // Express uses res.getHeaders()
      const headers =
        typeof res.getHeaders === "function" ? res.getHeaders() : res.headers;
      const logRes: any = { statusCode, headers };

      // If bodyForLogging was captured in res.locals, add it to the log
      if (res.locals && res.locals.hasOwnProperty("bodyForLogging")) {
        logRes.body = res.locals.bodyForLogging;
      } else {
        // Add a debug note if it's not found, to help diagnose
        logRes.body_debug_info = "bodyForLogging not found in res.locals";
      }
      return logRes;
    },
    err: stdSerializers.err,
  },
});
const app: express.Express = express();
const parser = bodyParser;

app.use(parser.urlencoded({ extended: true })); // Changed to extended: true
app.use(parser.json());
app.use(cookieParser()); // Use cookie-parser middleware

// Middleware to capture response body for logging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (bodyArgument: any) {
    let processedBody = bodyArgument;

    if (Buffer.isBuffer(bodyArgument)) {
      try {
        processedBody = bodyArgument.toString("utf8");
      } catch (error) {
        processedBody = "[Unable to convert buffer to string]";
      }
    }

    // Ensure res.locals exists
    if (!res.locals) {
      res.locals = {};
    }

    if (typeof processedBody === "string") {
      try {
        // If it's a JSON string, parse it so pino logs it as an object structure.
        res.locals.bodyForLogging = JSON.parse(processedBody);
      } catch (e) {
        // Not a valid JSON string (e.g., plain text, HTML, or empty string which errors on parse)
        // or parsing failed for other reasons. Store the string as is.
        res.locals.bodyForLogging = processedBody;
      }
    } else {
      // It's an object, array, boolean, number, null. Store as is.
      // Pino will serialize these directly.
      res.locals.bodyForLogging = processedBody;
    }

    return originalSend.call(this, bodyArgument); // Call originalSend with the original argument
  };
  next();
});

app.use(httpLogger);
app.use(attachDb); // Use attachDb middleware

// Example of how to protect all routes under /api/plaid (or any other path)
// app.use('/api/plaid', protect); // All plaid routes will now require authentication
// If you want to protect all routes, place it before app.use("/api", routes);
// app.use(protect) // This would protect all routes defined after it.

app.use("/api", routes);

// Catch-all route for 404 Not Found errors
app.use((_req, res) => {
  res.status(404).json({ error: "Page not found" });
});

export default app;
