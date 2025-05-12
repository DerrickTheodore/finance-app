import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path to package.json relative to this file (root directory)
const packageJsonPath = path.resolve(__dirname, "./package.json");

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  [key: string]: any; // Allow other properties
}

let packageJson: PackageJson = {};
let appVersion = "unknown";

try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
  packageJson = JSON.parse(packageJsonContent) as PackageJson;
  appVersion = packageJson.version || "unknown";
} catch (error) {
  console.error("Failed to read or parse package.json:", error);
  // Keep default values for packageJson and appVersion
}

export { appVersion, packageJson };
