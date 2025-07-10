import PlaidNode from "plaid"; // Use default import for Plaid SDK (CJS)
import { plaidClient } from "../client.js";
import { PlaidError } from "../errors.js";
export async function createLinkToken(params) {
    // Return the data part of the response
    const { userId, products } = params;
    if (!process.env.PLAID_CLIENT_ID ||
        !(process.env.PLAID_SANDBOX_SECRET || process.env.PLAID_PRODUCTION_SECRET)) {
        console.error("PLAID_CLIENT_ID or Plaid secrets are not set in .env");
        throw new Error("Plaid client credentials not configured.");
    }
    const request = {
        user: {
            client_user_id: userId,
        },
        client_name: "MyFi App",
        products: products,
        country_codes: [PlaidNode.CountryCode.Us],
        language: "en",
    };
    try {
        const response = await plaidClient.linkTokenCreate(request);
        return response.data;
    }
    catch (error) {
        throw PlaidError.fromCatch(error);
    }
}
export async function exchangePublicToken(publicToken) {
    try {
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;
        // Get item details to retrieve institution_id
        const itemGetRequest = { access_token: accessToken };
        const itemResponse = await plaidClient.itemGet(itemGetRequest);
        const institutionId = itemResponse.data.item.institution_id;
        if (!institutionId) {
            throw new PlaidError("Institution ID not found for the item.");
        }
        // Fetch institution details
        const institutionRequest = {
            institution_id: institutionId,
            country_codes: [PlaidNode.CountryCode.Us],
            options: {
                include_optional_metadata: true,
            },
        };
        const institutionResponse = await plaidClient.institutionsGetById(institutionRequest);
        const institutionName = institutionResponse.data.institution.name;
        return {
            accessToken,
            itemId,
            institutionId,
            institutionName,
        };
    }
    catch (error) {
        throw PlaidError.fromCatch(error);
    }
}
export async function getTransactions(params) {
    const { accessToken, startDate, endDate, accountIds, count, offset } = params;
    const request = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
            // Only pass account_ids if it's a non-empty array; otherwise, pass undefined.
            account_ids: accountIds && accountIds.length > 0 ? accountIds : undefined,
            count: count,
            offset: offset,
        },
    };
    try {
        const response = await plaidClient.transactionsGet(request);
        return response.data;
    }
    catch (error) {
        // Maintaining the existing error throwing style for this function
        console.error("[PlaidService] Error calling plaidClient.getTransactions:");
        throw PlaidError.fromCatch(error); // Added throw here
    }
}
export async function removeItem(accessToken) {
    console.log("[PlaidService] removeItem called for accessToken (first 5 chars):", accessToken.substring(0, 5));
    try {
        // The itemRemove endpoint does not return an item_id in the success response body directly.
        // It returns a request_id. The success is indicated by a 200 OK status.
        // If an error occurs, the Plaid client will throw an error which is caught below.
        await plaidClient.itemRemove({
            access_token: accessToken,
        });
        console.log(`[PlaidService] itemRemove call was successful for accessToken (first 5 chars): ${accessToken.substring(0, 5)}`);
    }
    catch (error) {
        console.error("[PlaidService] Error calling plaidClient.itemRemove:");
        throw PlaidError.fromCatch(error); // Convert to custom PlaidError and re-throw
    }
}
//# sourceMappingURL=index.js.map