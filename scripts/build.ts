import * as fs from "fs";
import * as path from "path";
import { Registry } from "../src/types";
import { arrayUniques, ax, validateRegistry } from "../src/helpers";
import { validateAllModules } from "./validate";

// Function to combine all JSON files into one registry
function buildRegistry(): void {
  const sourceDirectory1 = path.join(__dirname, "../../legend-kit/packages");
  const sourceDirectory2 = path.join(
    __dirname,
    "../../legend-kit-pro/packages",
  );
  const outputFilePath = path.join(__dirname, "../registry.json");

  console.log(`Building registry...`);

  // First validate all modules
  const { isValid, modules } = validateAllModules(
    sourceDirectory1,
    sourceDirectory2,
  );

  const uniqueModules = arrayUniques(modules.map((module) => module.name));

  if (uniqueModules.length !== modules.length) {
    const alreadyFound = new Set<string>();
    const dupes = modules
      .filter((module) => {
        if (alreadyFound.has(module.name)) {
          return true;
        }
        alreadyFound.add(module.name);
        return false;
      })
      .map((module) => module.name);

    console.error("❌ Duplicate module names found:", dupes);
    process.exit(1);
  }

  // Exit if validation failed
  if (!isValid) {
    console.error("❌ Cannot build registry: validation failed");
    process.exit(1);
  }

  // Create the registry object directly from validated modules
  const registry: Registry = { modules: modules };

  // Validate the entire registry
  if (!validateRegistry(registry)) {
    process.exit(1);
  }

  // Write the combined registry to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(registry, null, 2), "utf-8");
  console.log(`Registry saved to ${outputFilePath}`);

  // Report results
  console.log(`\nBuild Summary:`);
  console.log(`✅ Modules in registry: ${modules.length}`);
}

buildRegistry();
