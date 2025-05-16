import type {
  LinkTokenCreateRequest, // Type for Plaid error object structure from SDK
  TransactionsGetRequest,
  TransactionsGetResponse,
} from "plaid";
import PlaidNode from "plaid"; // Use default import for Plaid SDK (CJS)
import { plaidClient } from "../client.js";
import { PlaidError } from "../errors.js";

interface CreateLinkTokenParams {
  userId: string;
  products: PlaidNode.Products[]; // Use PlaidNode.Products
}

export async function createLinkToken(
  params: CreateLinkTokenParams
): Promise<PlaidNode.LinkTokenCreateResponse> {
  // Return the data part of the response
  const { userId, products } = params;

  if (
    !process.env.PLAID_CLIENT_ID ||
    !(process.env.PLAID_SANDBOX_SECRET || process.env.PLAID_PRODUCTION_SECRET)
  ) {
    console.error("PLAID_CLIENT_ID or Plaid secrets are not set in .env");
    throw new Error("Plaid client credentials not configured.");
  }

  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: userId,
    },
    client_name: "MyFi App",
    products: products,
    country_codes: [PlaidNode.CountryCode.Us], // Use PlaidNode.CountryCode
    language: "en",
  };

  try {
    const response = await plaidClient.linkTokenCreate(request);
    return response.data; // Access the data property of the Axios response
  } catch (error) {
    throw PlaidError.fromCatch(error);
  }
}

interface ExchangePublicTokenResponse {
  accessToken: string;
  itemId: string;
}

export async function exchangePublicToken(
  publicToken: string
): Promise<ExchangePublicTokenResponse> {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return {
      accessToken: response.data.access_token, // Access via response.data
      itemId: response.data.item_id, // Access via response.data
    };
  } catch (error) {
    throw PlaidError.fromCatch(error);
  }
}

interface GetTransactionsParams {
  accessToken: string;
  startDate: string;
  endDate: string;
  accountIds?: string[];
  count?: number;
  offset?: number;
}

export async function getTransactions(
  params: GetTransactionsParams
): Promise<TransactionsGetResponse> {
  const { accessToken, startDate, endDate, accountIds, count, offset } = params;
  const request: TransactionsGetRequest = {
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: {
      account_ids: accountIds,
      count: count,
      offset: offset,
    },
  };
  try {
    const response = await plaidClient.transactionsGet(request);
    return response.data; // Access the data property of the Axios response
  } catch (error) {
    throw new PlaidError("An unknown error occurred.");
  }
}
