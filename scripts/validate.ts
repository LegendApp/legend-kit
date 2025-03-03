import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { findJsonFiles, validateModuleFile } from "../src/helpers";
import { ModuleMetadata } from "../src/types";

const Directories = [".", "../legend-kit-pro"];

/**
 * Validates all module files in the given directory
 * @param sourceDirectory - Directory to search for JSON files
 * @returns Object containing validation status and validated modules
 */
export function validateAllModules(): {
  isValid: boolean;
  modules: ModuleMetadata[];
} {
  try {
    checkPrettierFormatting();
  } catch (error) {
    process.exit(1);
  }

  console.log("Validating all module files...");

  const rootDir = path.join(__dirname, "..");
  const directories = Directories.map((directory) =>
    path.join(rootDir, directory, "packages"),
  );

  // Find all JSON files in the directory
  const jsonFiles = directories.flatMap(findJsonFiles);
  console.log(`Found ${jsonFiles.length} JSON files to validate`);

  // Track validation results
  let invalidCount = 0;
  const validModules: ModuleMetadata[] = [];

  // Validate each file
  for (const file of jsonFiles) {
    const validatedModule = validateModuleFile(file);
    if (validatedModule) {
      validModules.push(validatedModule);
    } else {
      invalidCount++;
    }
  }

  // Print summary
  console.log("\nValidation Summary:");
  console.log(`✅ Valid: ${validModules.length}`);
  if (invalidCount > 0) {
    console.log(`❌ Invalid: ${invalidCount}`);
  }

  // Return validation status and validated modules
  return {
    isValid: invalidCount === 0,
    modules: validModules,
  };
}

/**
 * Checks if all TS/TSX files are properly formatted with Prettier
 * @param directories - Directories to check
 * @returns True if all files are formatted, otherwise throws an error
 */
export function checkPrettierFormatting(): boolean {
  console.log("\nChecking code formatting with Prettier...");

  try {
    Directories.forEach((directory) => {
      // Run prettier in quiet mode to minimize output when there are no issues
      execSync(`prettier --check \"${directory}/**/*.{ts,tsx,json,md}\"`, {
        stdio: "inherit", // Still inherit stdio to show errors when they happen
        encoding: "utf-8",
      });
    });

    console.log("✅ Format check passed");
    return true;
  } catch (error) {
    // The error thrown by execSync already contains the Prettier output
    // showing which files have issues, so we don't need to add more output here
    console.log('\nRun "npm run format" to fix formatting issues');
    throw error; // Re-throw the error to be caught by the caller
  }
}

// Script execution when run directly
if (require.main === module) {
  const moduleValidation = validateAllModules();
  // Exit with error code if any validation failed
  if (!moduleValidation.isValid) {
    process.exit(1);
  }
}
