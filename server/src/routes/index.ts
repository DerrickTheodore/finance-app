import type { Request, Response } from "express";
import express, { Router } from "express"; // Added express and Router import
import { appVersion, packageJson } from "../../packageInfo.js";
import plaidRouter from "./plaid/router.js"; // Updated import path for plaidRouter

const router: Router = express.Router(); // Create a new router instance

// Info endpoint
router.get("/info", (_req: Request, res: Response) => {
  res.status(200).json({
    name: packageJson.name, // Use name from packageJson
    version: appVersion,
    description: packageJson.description,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development", // Example of another useful info
    publicEndpoints: {
      info: {
        method: "GET",
        path: "/api/info",
        description:
          "Provides information about the API, including version and available public endpoints.",
      },
      createLinkToken: {
        method: "POST",
        path: "/api/plaid/create_link_token",
        description:
          "Creates a Plaid link token for initializing the Plaid Link flow. Requires 'userId' in the request body.",
      },
      exchangePublicToken: {
        method: "POST",
        path: "/api/plaid/exchange_public_token",
        description:
          "Exchanges a Plaid public_token for an access_token and item_id. Requires 'public_token' in the request body.",
      },
      getTransactions: {
        method: "GET",
        path: "/api/plaid/transactions",
        description:
          "Fetches transactions for a given Plaid access_token. Requires 'access_token', 'start_date', and 'end_date' as query parameters. Optional 'account_ids' query parameter.",
      },
    },
  });
});

// Mount the Plaid routes
router.use("/plaid", plaidRouter);

export default router;
