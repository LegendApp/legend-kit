import * as fs from "fs";
import * as path from "path";
import { z, ZodSchema, ZodError } from "zod";
import { PackageMetadata } from "./types";
import { packageMetadataSchema, registrySchema } from "./zodSchemas";
import { createHash } from "crypto";

/**
 * Function to recursively find all JSON files in a directory
 * @param dir - Directory to search
 * @returns Array of file paths
 */
export function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  // Get all files in the current directory
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If it's a directory, recursively search inside it
      files.push(...findJsonFiles(fullPath));
    } else if (path.extname(item) === ".json") {
      // If it's a JSON file, add it to our list
      files.push(fullPath);
    }
  }

  return files;
}

function calculateFileHash(filePath: string): string {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    // Convert to string and normalize line endings
    const content = fileBuffer.toString().replace(/\r\n/g, "\n");
    const hashSum = createHash("sha256");
    hashSum.update(content);

    const hash = hashSum.digest("hex");
    return hash;
  } catch (error) {
    console.error(`❌ Error calculating hash for ${filePath}:`, error);
    return "";
  }
}

/**
 * Function to validate a JSON file as a PackageMetadata
 * @param filePath - Path to the JSON file
 * @returns Validated data or null if invalid
 */
export function validatePackageFile(filePath: string): PackageMetadata | null {
  try {
    const pathWithoutDir = filePath.replace(/^(.*\/packages\/)/, "");
    const [dir, name] = pathWithoutDir.split("/");

    // Read and parse the JSON file
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Validate against our schema
    const result = packageMetadataSchema.safeParse(data);

    if (!result.success) {
      console.error(`❌ ${filePath} failed Zod schema`);
      formatZodErrors(result.error);
      return null;
    }

    if (!dir) {
      console.error(`❌ ${filePath} has no directory`);
      return null;
    }

    const packageMetadata = JSON.parse(
      JSON.stringify(result.data),
    ) as unknown as PackageMetadata;

    if (dir && name) {
      packageMetadata!.dir = dir;
    } else {
      throw new Error(`❌ ${filePath} has no directory`);
    }

    const isPro = filePath.includes("legend-kit-pro");
    if (isPro !== packageMetadata!.pro) {
      console.error(`❌ ${filePath} has a mismatching pro value`);
      return null;
    }

    // Check that the package's implementation file exists
    const packageDir = path.dirname(filePath);
    const packageBaseName = path.basename(filePath, ".json");
    const tsPath = path.join(packageDir, packageBaseName + ".ts");
    const tsxPath = path.join(packageDir, packageBaseName + ".tsx");

    if (fs.existsSync(tsPath)) {
      packageMetadata.file = packageBaseName + ".ts";
    } else if (fs.existsSync(tsxPath)) {
      packageMetadata.file = packageBaseName + ".tsx";
    } else {
      console.error(
        `❌ ${filePath}: Implementation file "${packageBaseName}.ts(x)" does not exist`,
      );
      return null;
    }

    packageMetadata.sha = calculateFileHash(
      path.join(packageDir, packageMetadata.file),
    );

    // Check that all imported packages exist
    if (packageMetadata.imports) {
      for (const importPath of packageMetadata.imports) {
        const fullPath1 = path.join(packageDir, importPath + ".ts");
        const fullPath2 = path.join(packageDir, "..", importPath + ".ts");
        if (!fs.existsSync(fullPath1) && !fs.existsSync(fullPath2)) {
          console.error(
            `❌ ${filePath}: Imported package "${importPath}" does not exist at ${fullPath1} or ${fullPath2}`,
          );
          return null;
        }
      }
    }

    return packageMetadata;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return null;
  }
}

/**
 * Function to validate any data against a Zod schema
 * @param filePath - Path to the JSON file
 * @param schema - Zod schema to use for validation
 * @returns Validated data or null if invalid
 */
export function validateJsonFile<T>(
  filePath: string,
  schema: ZodSchema,
): T | null {
  try {
    // Read and parse the JSON file
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Validate against our schema
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error(`❌ ${filePath} is not valid:`);
      formatZodErrors(result.error);
      return null;
    }

    return result.data as T;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return null;
  }
}

/**
 * Checks if a JSON file is valid according to a schema
 * @param filePath - Path to the JSON file
 * @param schema - Zod schema to use for validation
 * @returns Boolean indicating if the file is valid
 */
export function isJsonFileValid<T>(
  filePath: string,
  schema: ZodSchema,
): boolean {
  return validateJsonFile<T>(filePath, schema) !== null;
}

/**
 * Validates a registry object against the registry schema
 * @param registry - Registry object to validate
 * @returns True if valid, false if invalid
 */
export function validateRegistry(registry: any): boolean {
  const result = registrySchema.safeParse(registry);

  if (!result.success) {
    console.error("❌ Registry validation failed:");
    console.error(result.error);
    return false;
  }

  return true;
}

/**
 * Helper function to format Zod errors for better readability
 * @param error - ZodError object
 */
function formatZodErrors(error: ZodError): void {
  error.issues.forEach((issue: z.ZodIssue) => {
    console.error(`  - Path: ${issue.path.join(".")}, Error: ${issue.message}`);
  });
}

function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

export function ax<T>(arr: (T | boolean | "")[]): T[];
export function ax<T>(...arr: (T | boolean | "")[]): T[];
export function ax<T>(...params: (T | boolean | "")[]): T[] {
  const arr = params.length === 1 && isArray(params[0]) ? params[0] : params;
  return arr.filter(Boolean) as T[];
}

export function arrayUniques<T>(arrs: T[]): T[] {
  return Array.from(new Set(arrs));
}
