import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/**
 * Build the CLI distribution package
 */
function buildCli(): void {
  console.log("Building CLI distribution...");

  const rootDir = path.join(__dirname, "..");
  const distDir = path.join(rootDir, "dist");

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  // Read the main package.json
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Create a modified package.json for distribution
  const cliPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    private: false,
    sideEffects: false,
    main: "cli.js",
    type: "module",
    bin: {
      "legend-kit": "./cli.js",
    },
    dependencies: packageJson.dependencies,
    // Omit scripts and devDependencies
    keywords: packageJson.keywords || [],
    author: packageJson.author,
    license: packageJson.license,
    engines: packageJson.engines,
  };

  // Write the modified package.json to dist folder
  const distPackageJsonPath = path.join(distDir, "package.json");
  fs.writeFileSync(
    distPackageJsonPath,
    JSON.stringify(cliPackageJson, null, 2) + "\n",
  );

  // Copy the existing CLI file from cli/cli.js
  const cliSourcePath = path.join(rootDir, "cli", "cli.js");
  const cliDestPath = path.join(distDir, "cli.js");

  if (!fs.existsSync(cliSourcePath)) {
    console.error(`❌ CLI source file not found: ${cliSourcePath}`);
    process.exit(1);
  }

  console.log(`Copying CLI from ${cliSourcePath} to ${cliDestPath}`);
  fs.copyFileSync(cliSourcePath, cliDestPath);

  // Make the CLI file executable
  fs.chmodSync(cliDestPath, "755");

  console.log("✅ CLI build complete!");
  console.log(`📁 Distribution files created in: ${distDir}`);
}

// Run the build when executed directly
if (require.main === module) {
  buildCli();
}
