/**
 * BaseError is a custom error class that all application errors should extend.
 *
 * @class BaseError
 * @extends {Error}
 * @property {number | undefined} statusCode - Optional HTTP status code for the error.
 * @property {unknown} cause - Optional underlying cause of the error (can be any value).
 *
 * @example
 * throw new BaseError('Something went wrong', 500);
 */
export class BaseError extends Error {
  /** Optional HTTP status code for the error. */
  public statusCode?: number;
  /** Optional underlying cause of the error. */
  public cause?: unknown;

  /**
   * Creates a new BaseError instance.
   * @param {string} message - The error message.
   * @param {number} [statusCode] - Optional HTTP status code.
   * @param {unknown} [cause] - Optional underlying cause of the error.
   */
  constructor(message: string, statusCode?: number, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.cause = cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
