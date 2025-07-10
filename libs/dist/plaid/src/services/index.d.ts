import type { TransactionsGetResponse } from "plaid";
import PlaidNode from "plaid";
interface CreateLinkTokenParams {
    userId: string;
    products: PlaidNode.Products[];
}
export declare function createLinkToken(params: CreateLinkTokenParams): Promise<PlaidNode.LinkTokenCreateResponse>;
interface ExchangePublicTokenResponse {
    accessToken: string;
    itemId: string;
    institutionId: string;
    institutionName: string;
}
export declare function exchangePublicToken(publicToken: string): Promise<ExchangePublicTokenResponse>;
interface GetTransactionsParams {
    accessToken: string;
    startDate: string;
    endDate: string;
    accountIds?: string[];
    count?: number;
    offset?: number;
}
export declare function getTransactions(params: GetTransactionsParams): Promise<TransactionsGetResponse>;
export declare function removeItem(accessToken: string): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map