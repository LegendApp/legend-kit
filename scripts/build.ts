import * as fs from "fs";
import * as path from "path";
import { Registry } from "../src/types";
import { arrayUniques, ax, validateRegistry } from "../src/helpers";
import { validateAllPackages } from "./validate";

/**
 * Main build function to create the registry
 */
function buildRegistry(): void {
  const outputFilePath = path.join(__dirname, "../registry.json");

  console.log(`Building registry...`);

  // First validate all packages
  const { isValid, packages } = validateAllPackages();

  const uniquePackages = arrayUniques(packages.map((pkg) => pkg.name));

  if (uniquePackages.length !== packages.length) {
    const alreadyFound = new Set<string>();
    const dupes = packages
      .filter((pkg) => {
        if (alreadyFound.has(pkg.name)) {
          return true;
        }
        alreadyFound.add(pkg.name);
        return false;
      })
      .map((pkg) => pkg.name);

    console.error("❌ Duplicate package names found:", dupes);
    process.exit(1);
  }

  // Exit if validation failed
  if (!isValid) {
    console.error("❌ Cannot build registry: validation failed");
    process.exit(1);
  }

  // Create the registry object directly from validated packages
  const registry: Registry = {
    updatedAt: new Date().toISOString(),
    packages: packages,
  };

  // Validate the entire registry
  if (!validateRegistry(registry)) {
    process.exit(1);
  }

  // Write the combined registry to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(registry, null, 2), "utf-8");
  console.log(`Registry saved to ${outputFilePath}`);

  // Report results
  console.log(`\nBuild Summary:`);
  console.log(`✅ Packages in registry: ${packages.length}`);
}

// Run the build when executed directly
if (require.main === module) {
  buildRegistry();
}
