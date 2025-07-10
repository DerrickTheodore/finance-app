import { PlaidError as SDKPlaidErrorType } from "plaid";
export declare function isSdkPlaidError(error: any): error is SDKPlaidErrorType;
export declare class PlaidError extends Error {
    status_code?: number;
    error_code?: string;
    error_type?: string;
    display_message?: string | null;
    request_id?: string;
    causes?: any[];
    error_message: string;
    sdk_error_message?: string;
    constructor(primary_message: string, details?: {
        status_code?: number;
        error_code?: string;
        error_type?: string;
        display_message?: string | null;
        request_id?: string;
        causes?: any[];
        sdk_message?: string;
    } | null);
    static fromCatch(error: unknown): PlaidError;
    isTokenError(): boolean;
}
//# sourceMappingURL=errors.d.ts.map