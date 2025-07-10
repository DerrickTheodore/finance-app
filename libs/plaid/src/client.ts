import Plaid from "plaid"; // Use a consistent name for the default import

const configuration = new Plaid.Configuration({
  // Access Configuration as a property of the default import
  basePath:
    process.env.PLAID_ENV === "production"
      ? Plaid.PlaidEnvironments.production // Access PlaidEnvironments as a property
      : Plaid.PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET":
        process.env.PLAID_ENV === "production"
          ? process.env.PLAID_PRODUCTION_SECRET!
          : process.env.PLAID_SANDBOX_SECRET!,
    },
  },
});

const plaidClient = new Plaid.PlaidApi(configuration); // Access PlaidApi as a property

export { plaidClient };
