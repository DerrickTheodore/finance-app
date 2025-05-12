import { PlaidError as SDKPlaidErrorType } from "plaid";

// Type guard for Plaid SDK errors
export function isSdkPlaidError(error: any): error is SDKPlaidErrorType {
  return (
    error &&
    typeof error === "object" &&
    ("error_type" in error || "error_code" in error) &&
    "error_message" in error &&
    "status" in error
  );
}

export class PlaidError extends Error {
  public status_code?: number;
  public error_code?: string;
  public error_type?: string;
  public display_message?: string | null;
  public request_id?: string;
  public causes?: any[];
  public error_message: string; // Primary, most specific error message
  public sdk_error_message?: string; // Original top-level message from SDK error instance

  constructor(
    primary_message: string,
    details?: {
      status_code?: number;
      error_code?: string;
      error_type?: string;
      display_message?: string | null;
      request_id?: string;
      causes?: any[];
      sdk_message?: string; // To store the original top-level message from the SDK error
    } | null
  ) {
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

  static fromCatch(error: unknown): PlaidError {
    const unknownError = error as any; // Type assertion for easier property access

    // Duck-typing to identify Plaid SDK errors
    // SDK errors typically have: name: 'PlaidError', and details in error.response.data
    if (
      unknownError &&
      typeof unknownError === "object" &&
      unknownError.name === "PlaidError" && // Check the name property of the error instance
      unknownError.response &&
      typeof unknownError.response === "object" &&
      unknownError.response.data &&
      typeof unknownError.response.data === "object"
    ) {
      const sdkErrorData = unknownError.response.data as SDKPlaidErrorType;
      // Determine the most specific message for our primary error_message
      const primary_message =
        sdkErrorData.error_message ||
        sdkErrorData.display_message ||
        unknownError.message ||
        "Plaid API Error";

      return new PlaidError(primary_message, {
        status_code: unknownError.response.status, // HTTP status from the response
        error_code: sdkErrorData.error_code,
        error_type: sdkErrorData.error_type,
        display_message: sdkErrorData.display_message,
        request_id: sdkErrorData.request_id,
        causes: sdkErrorData.causes as any[],
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

  isTokenError(): boolean {
    return (
      this.error_code === "ITEM_LOGIN_REQUIRED" ||
      this.error_type === "ITEM_ERROR" ||
      this.error_code === "INVALID_ACCESS_TOKEN"
    );
  }
}
