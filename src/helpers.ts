import * as fs from "fs";
import * as path from "path";
import { z, ZodSchema, ZodError } from "zod";
import { ModuleMetadata } from "./types";
import { moduleMetadataSchema, registrySchema } from "./zodSchemas";

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

/**
 * Function to validate a JSON file as a ModuleMetadata
 * @param filePath - Path to the JSON file
 * @returns Validated data or null if invalid
 */
export function validateModuleFile(filePath: string): ModuleMetadata | null {
  try {
    // Read and parse the JSON file
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Validate against our schema
    const result = moduleMetadataSchema.safeParse(data);

    if (!result.success) {
      console.error(`❌ ${filePath} is not valid:`);
      formatZodErrors(result.error, filePath);
      return null;
    }

    return result.data;
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
      formatZodErrors(result.error, filePath);
      return null;
    }

    return result.data as T;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return null;
  }
}

/**
 * Checks if a JSON file is valid as a ModuleMetadata
 * @param filePath - Path to the JSON file
 * @returns Boolean indicating if the file is valid
 */
export function isModuleFileValid(filePath: string): boolean {
  return validateModuleFile(filePath) !== null;
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
 * @param filePath - Path to the file that caused the error
 */
function formatZodErrors(error: ZodError, filePath: string): void {
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
