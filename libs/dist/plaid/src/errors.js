// Type guard for Plaid SDK errors
export function isSdkPlaidError(error) {
    return (error &&
        typeof error === "object" &&
        ("error_type" in error || "error_code" in error) &&
        "error_message" in error &&
        "status" in error);
}
export class PlaidError extends Error {
    status_code;
    error_code;
    error_type;
    display_message;
    request_id;
    causes;
    error_message; // Primary, most specific error message
    sdk_error_message; // Original top-level message from SDK error instance
    constructor(primary_message, details) {
        super(primary_message); // Sets 'this.message' to primary_message
        this.name = "MyFiPlaidError"; // Distinct name for this custom error class
        this.error_message = primary_message; // Ensure error_message is explicitly set
        if (details) {
            this.status_code = details.status_code;
            this.error_code = details.error_code;
            this.error_type = details.error_type;
            this.display_message = details.display_message;
            this.request_id = details.request_id;
            this.causes = details.causes;
            this.sdk_error_message = details.sdk_message;
        }
        // Correctly set the prototype for custom errors extending built-in Error
        Object.setPrototypeOf(this, PlaidError.prototype);
    }
    static fromCatch(error) {
        const unknownError = error; // Type assertion for easier property access
        // Duck-typing to identify Plaid SDK errors
        // SDK errors typically have: name: 'PlaidError', and details in error.response.data
        if (unknownError &&
            typeof unknownError === "object" &&
            unknownError.name === "PlaidError" && // Check the name property of the error instance
            unknownError.response &&
            typeof unknownError.response === "object" &&
            unknownError.response.data &&
            typeof unknownError.response.data === "object") {
            const sdkErrorData = unknownError.response.data;
            // Determine the most specific message for our primary error_message
            const primary_message = sdkErrorData.error_message ||
                sdkErrorData.display_message ||
                unknownError.message ||
                "Plaid API Error";
            return new PlaidError(primary_message, {
                status_code: unknownError.response.status, // HTTP status from the response
                error_code: sdkErrorData.error_code,
                error_type: sdkErrorData.error_type,
                display_message: sdkErrorData.display_message,
                request_id: sdkErrorData.request_id,
                causes: sdkErrorData.causes,
                sdk_message: unknownError.message, // Store the original top-level SDK error message
            });
        }
        // If the error is already an instance of our custom PlaidError
        if (error instanceof PlaidError) {
            return error;
        }
        // If it's a generic Error instance
        if (error instanceof Error) {
            return new PlaidError(error.message, { sdk_message: error.message });
        }
        // Fallback for truly unknown errors
        return new PlaidError("An unknown error occurred.");
    }
    isTokenError() {
        return (this.error_code === "ITEM_LOGIN_REQUIRED" ||
            this.error_type === "ITEM_ERROR" ||
            this.error_code === "INVALID_ACCESS_TOKEN");
    }
}
//# sourceMappingURL=errors.js.map