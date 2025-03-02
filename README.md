# Legend Kit

A modular toolkit for Legend with a structured approach to module management.

## Structure

- Each module consists of a TypeScript file (`.ts` or `.tsx`) and a corresponding `.json` metadata file
- The metadata includes name, version, type, dependencies, and files
- Modules are organized in the `src` directory

## Examples

- Main utilities: `createDraft`, `isWindowFocused`, `onHotkeys`
- Converters in the `as` folder: `objectAsArray`, `arrayAsObject`

## Module Schema

Each module's JSON metadata file must conform to the TypeScript types defined in `src/types.ts`. We use Zod for runtime validation to ensure all JSON files match the expected structure:

```typescript
interface ModuleMetadata {
  // The name of the module
  name: string;

  // The version in semver format (x.y.z)
  version: string;

  // The type of module
  type: "utility" | "browser" | "event" | "converter";

  // Array of module dependencies
  dependencies: string[];

  // Array of files included in this module
  files: string[];
}
```

The Zod schemas are defined in `src/zodSchemas.ts` and match the TypeScript types exactly.

## Validation

The project includes TypeScript-based validation using Zod to ensure all module metadata files conform to the types:

```bash
# Run validation only
npm run validate

# Build will also validate before generating the registry
npm run build
```

Any invalid files will be reported with specific errors.

## Building

The project includes a build script that combines all module metadata into a single registry:

```bash
# Install dependencies
npm install

# Run the build script
npm run build
```

This will generate a `registry.json` file in the root directory containing all the module metadata in the following format:

```typescript
interface Registry {
  modules: ModuleMetadata[];
}
```

## Development

The project uses a set of helper functions in `src/helpers.ts` that provide:

- Type validation using Zod
- File discovery and traversal
- JSON file parsing and validation

These helpers are used by both the build and validation scripts to avoid code duplication and ensure consistent behavior.
