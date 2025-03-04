import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { findJsonFiles, validateModuleFile } from "../src/helpers";
import { ModuleMetadata } from "../src/types";

const Directories = [".", "../legend-kit-pro"];

/**
 * Checks if a TypeScript file imports from other modules
 * @param filePath - Path to the TypeScript file
 * @returns Array of imported module paths
 */
function findModuleImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const imports: string[] = [];

  // Match any relative imports (starting with ./ or ../)
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const [, relativePath] = match;
    // Convert the relative path to our module format
    // Remove ./ or ../ prefix and .ts extension if present
    const normalizedPath = relativePath
      .replace(/^\.\.?\//, "")
      .replace(/\.ts$/, "");
    imports.push(normalizedPath);
  }

  return imports;
}

/**
 * Validates that a module's imports match its implementation
 * @param moduleFile - Path to the JSON module file
 * @param moduleData - Parsed module metadata
 * @returns true if imports are valid, false otherwise
 */
function validateModuleImports(
  moduleFile: string,
  moduleData: ModuleMetadata,
): boolean {
  const moduleDir = path.dirname(moduleFile);
  const moduleBaseName = path.basename(moduleFile, ".json");
  const implPath = path.join(moduleDir, moduleBaseName + ".ts");

  if (!fs.existsSync(implPath)) {
    return false; // This will be caught by the main validation
  }

  const actualImports = findModuleImports(implPath);
  const declaredImports = moduleData.imports || [];

  // Check if all actual imports are declared
  const missingImports = actualImports.filter(
    (imp) => !declaredImports.includes(imp),
  );
  if (missingImports.length > 0) {
    console.error(
      `❌ ${moduleFile}: Missing imports in JSON: ${missingImports.join(", ")}`,
    );
    return false;
  }

  // Check if all declared imports are actually used
  const unusedImports = declaredImports.filter(
    (imp) => !actualImports.includes(imp),
  );
  if (unusedImports.length > 0) {
    console.error(
      `❌ ${moduleFile}: Unused imports in JSON: ${unusedImports.join(", ")}`,
    );
    return false;
  }

  return true;
}

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
      // Additional validation for imports
      if (!validateModuleImports(file, validatedModule)) {
        invalidCount++;
        continue;
      }
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
