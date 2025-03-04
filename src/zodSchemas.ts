import { z } from "zod";
import { PackagePlatform, PackageType } from "./types";

// Define a Zod schema for PackageType
export const packageTypeSchema = z.enum([
  "linked",
  "observable",
  "hook",
  "utility",
]) as z.ZodType<PackageType>;

export const packagePlatformSchema = z.enum([
  "web",
  "rn",
  "all",
]) as z.ZodType<PackagePlatform>;

// Define a Zod schema for PackageMetadata
export const packageMetadataSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Version must be in semver format (x.y.z)",
  }),
  type: packageTypeSchema,
  platform: packagePlatformSchema,
  dependencies: z.array(z.string()),
  imports: z.array(z.string()).optional(),
  pro: z.boolean(),
  description: z.string(),
});

// Define a Zod schema for Registry
export const registrySchema = z.object({
  packages: z.array(
    z.object({
      name: z.string(),
      version: z.string().regex(/^\d+\.\d+\.\d+$/, {
        message: "Version must be in semver format (x.y.z)",
      }),
      type: packageTypeSchema,
      platform: packagePlatformSchema,
      dependencies: z.array(z.string()),
      imports: z.array(z.string()).optional(),
      pro: z.boolean(),
      description: z.string(),
      // Added by the build script
      dir: z.string(),
    }),
  ),
});

// Export types inferred from our Zod schemas
export type ZodPackageMetadata = z.infer<typeof packageMetadataSchema>;
export type ZodRegistry = z.infer<typeof registrySchema>;
