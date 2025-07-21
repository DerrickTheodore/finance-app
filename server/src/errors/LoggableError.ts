import { isObject } from "@/utils/typeCheckers.js";
import { BaseError } from "./index.js";

/**
 * LoggableError is intended for errors that should be logged in a human-readable way.
 * It extracts and formats details from a Node error or any thrown value, and provides a log-friendly summary.
 *
 * @class LoggableError
 * @extends {BaseError}
 * @property {Record<string, unknown>} details - Extracted details from the original error.
 *
 * @example
 * try {
 *   // some code that throws
 * } catch (err) {
 *   throw new LoggableError(err, 'Failed to process request', 500);
 * }
 */
export class LoggableError extends BaseError {
  /** Extracted details from the original error. */
  public details: Record<string, unknown>;

  /**
   * Creates a new LoggableError instance.
   * @param {unknown} error - The original error or thrown value.
   * @param {string} [message] - Optional human-readable error message.
   * @param {number} [statusCode] - Optional HTTP status code.
   */
  constructor(
    error: unknown,
    message = "An unexpected error occurred",
    statusCode?: number
  ) {
    super(message, statusCode, error);
    this.details = LoggableError.extractDetails(error);
  }

  /**
   * Extracts details from a Node error or any thrown value for logging.
   * @param {unknown} error - The error or value to extract details from.
   * @returns {Record<string, unknown>} Extracted details.
   */
  static extractDetails(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...("code" in error ? { code: error.code } : {}),
      };
    }
    if (isObject(error)) {
      return { ...error };
    }
    return { value: error };
  }

  /**
   * Returns a human-readable summary for logging.
   * @returns {object} Log-friendly error summary.
   */
  toLogObject() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      cause: this.cause,
    };
  }
}
