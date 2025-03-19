import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { findJsonFiles, validatePackageFile } from "../src/helpers";
import { PackageMetadata } from "../src/types";

const Directories = [".", "../legend-kit-pro"];

/**
 * Checks if a TypeScript file imports from other packages
 * @param filePath - Path to the TypeScript file
 * @returns Array of imported package paths
 */
function findPackageImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const imports: string[] = [];

  // Match any relative imports (starting with ./ or ../)
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const [, relativePath] = match;
    // Convert the relative path to our package format
    // Remove ./ or ../ prefix and .ts extension if present
    const normalizedPath = relativePath
      .replace(/^\.\.?\//, "")
      .replace(/\.ts$/, "");
    imports.push(normalizedPath);
  }

  return imports;
}

/**
 * Validates that a package's imports match its implementation
 * @param packageFile - Path to the JSON package file
 * @param packageData - Parsed package metadata
 * @returns true if imports are valid, false otherwise
 */
function validatePackageImports(
  packageFile: string,
  packageData: PackageMetadata,
): boolean {
  const packageDir = path.dirname(packageFile);
  const packageBaseName = path.basename(packageFile, ".json");
  const implPath1 = path.join(packageDir, packageBaseName + ".ts");
  const implPath2 = path.join(packageDir, packageBaseName + ".tsx");
  const implPath = fs.existsSync(implPath1)
    ? implPath1
    : fs.existsSync(implPath2)
      ? implPath2
      : null;
  if (!implPath) {
    console.error(
      `❌ ${packageFile}: Missing implementation file`,
      implPath1,
      implPath2,
    );
    return false; // This will be caught by the main validation
  }

  const actualImports = findPackageImports(implPath);
  const declaredImports = packageData.imports || [];

  // Check if all actual imports are declared
  const missingImports = actualImports.filter(
    (imp) => !declaredImports.includes(imp),
  );
  if (missingImports.length > 0) {
    console.error(
      `❌ ${packageFile}: Missing imports in JSON: ${missingImports.join(", ")}`,
    );
    return false;
  }

  // Check if all declared imports are actually used
  const unusedImports = declaredImports.filter(
    (imp) => !actualImports.includes(imp),
  );
  if (unusedImports.length > 0) {
    console.error(
      `❌ ${packageFile}: Unused imports in JSON: ${unusedImports.join(", ")}`,
    );
    return false;
  }

  return true;
}

/**
 * Validates all package files in the given directory
 * @param sourceDirectory - Directory to search for JSON files
 * @returns Object containing validation status and validated packages
 */
export function validateAllPackages(): {
  isValid: boolean;
  packages: PackageMetadata[];
} {
  try {
    checkPrettierFormatting();
  } catch (error) {
    process.exit(1);
  }

  console.log("Validating all package files...");

  const rootDir = path.join(__dirname, "..");
  const directories = Directories.map((directory) =>
    path.join(rootDir, directory, "packages"),
  );

  // Find all JSON files in the directory
  const jsonFiles = directories.flatMap(findJsonFiles);
  console.log(`Found ${jsonFiles.length} JSON files to validate`);

  // Track validation results
  let invalidCount = 0;
  const validPackages: PackageMetadata[] = [];

  // Validate each file
  for (const file of jsonFiles) {
    const validatedPackage = validatePackageFile(file);
    if (validatedPackage) {
      // Additional validation for imports
      if (!validatePackageImports(file, validatedPackage)) {
        invalidCount++;
        continue;
      }
      validPackages.push(validatedPackage);
    } else {
      invalidCount++;
    }
  }

  // Print summary
  console.log("\nValidation Summary:");
  console.log(`✅ Valid: ${validPackages.length}`);
  if (invalidCount > 0) {
    console.log(`❌ Invalid: ${invalidCount}`);
  }

  // Return validation status and validated packages
  return {
    isValid: invalidCount === 0,
    packages: validPackages,
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
  const packageValidation = validateAllPackages();
  // Exit with error code if any validation failed
  if (!packageValidation.isValid) {
    process.exit(1);
  }
}
