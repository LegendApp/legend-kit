/**
 * Represents the package types available in the system
 */
export type PackageType = "linked" | "observable" | "hook" | "utility";
export type PackagePlatform = "web" | "rn" | "all";

/**
 * Interface describing the structure of a package's metadata
 */
export interface PackageMetadata {
  /**
   * The name of the package
   */
  name: string;

  /**
   * The name of the package
   */
  description: string;

  /**
   * The version of the package in semver format (x.y.z)
   */
  version: string;

  /**
   * The type of the package
   */
  type: PackageType;

  /**
   * The platform of the package
   */
  platform: PackagePlatform;

  /**
   * Array of package dependencies
   */
  dependencies: string[];

  /**
   * Optional array of packages this package imports
   */
  imports?: string[];

  /**
   * Is this package a Pro feature?
   */
  pro: boolean;

  /**
   * The directory of the package
   */
  dir?: string;

  /**
   * The implementation file name (.ts or .tsx)
   */
  file?: string;

  /**
   * The SHA of the implementation file
   */
  sha?: string;
}

export interface PackageFile {
  path: string;
  sha: string;
}

/**
 * Interface for the combined registry of all packages
 */
export interface Registry {
  updatedAt: string;
  packages: PackageMetadata[];
}
