/**
 * Represents the module types available in the system
 */
export type ModuleType = "utility" | "browser" | "event" | "converter";

/**
 * Interface describing the structure of a module's metadata
 */
export interface ModuleMetadata {
  /**
   * The name of the module
   */
  name: string;

  /**
   * The version of the module in semver format (x.y.z)
   */
  version: string;

  /**
   * The type of the module
   */
  type: ModuleType;

  /**
   * Array of module dependencies
   */
  dependencies: string[];

  /**
   * Array of files included in this module
   */
  files: string[];

  /**
   * Is this module a Pro feature?
   */
  pro: boolean;

  /**
   * The directory of the module
   */
  dir?: string;
}

/**
 * Interface for the combined registry of all modules
 */
export interface Registry {
  modules: ModuleMetadata[];
}
