import crypto from "crypto";
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY_HEX = process.env.PLAID_ENCRYPTION_KEY;
const IV_HEX = process.env.PLAID_ENCRYPTION_IV;
if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    throw new Error("PLAID_ENCRYPTION_KEY environment variable is missing, not hex, or not 32 bytes (64 hex characters).");
}
if (!IV_HEX || IV_HEX.length !== 32) {
    throw new Error("PLAID_ENCRYPTION_IV environment variable is missing, not hex, or not 16 bytes (32 hex characters).");
}
const KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");
const IV = Buffer.from(IV_HEX, "hex");
export function encrypt(text) {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}
export function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
//# sourceMappingURL=index.js.map