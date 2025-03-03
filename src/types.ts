/**
 * Represents the module types available in the system
 */
export type ModuleType = "linked" | "observable" | "hook" | "utility";
export type ModulePlatform = "web" | "rn" | "all";

/**
 * Interface describing the structure of a module's metadata
 */
export interface ModuleMetadata {
  /**
   * The name of the module
   */
  name: string;

  /**
   * The name of the module
   */
  description: string;

  /**
   * The version of the module in semver format (x.y.z)
   */
  version: string;

  /**
   * The type of the module
   */
  type: ModuleType;

  /**
   * The platform of the module
   */
  platform: ModulePlatform;

  /**
   * Array of module dependencies
   */
  dependencies: string[];

  /**
   * Array of files included in this module
   */
  files: ModuleFile[];

  /**
   * Is this module a Pro feature?
   */
  pro: boolean;

  /**
   * The directory of the module
   */
  dir?: string;
}

export interface ModuleFile {
  path: string;
  sha: string;
}

/**
 * Interface for the combined registry of all modules
 */
export interface Registry {
  updatedAt: string;
  modules: ModuleMetadata[];
}
