import { z } from "zod";
import { ModulePlatform, ModuleType } from "./types";

// Define a Zod schema for ModuleType
export const moduleTypeSchema = z.enum([
  "linked",
  "observable",
  "hook",
  "utility",
]) as z.ZodType<ModuleType>;

export const modulePlatformSchema = z.enum([
  "web",
  "rn",
  "all",
]) as z.ZodType<ModulePlatform>;

// Define a Zod schema for ModuleMetadata
export const moduleMetadataSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Version must be in semver format (x.y.z)",
  }),
  type: moduleTypeSchema,
  platform: modulePlatformSchema,
  dependencies: z.array(z.string()),
  files: z.array(z.string()).min(1, {
    message: "At least one file must be specified",
  }),
  pro: z.boolean(),
  description: z.string(),
});

// Define a Zod schema for Registry
export const registrySchema = z.object({
  modules: z.array(
    z.object({
      name: z.string(),
      version: z.string().regex(/^\d+\.\d+\.\d+$/, {
        message: "Version must be in semver format (x.y.z)",
      }),
      type: moduleTypeSchema,
      platform: modulePlatformSchema,
      dependencies: z.array(z.string()),
      // Changed by the build script
      files: z.array(
        z.object({
          path: z.string(),
          sha: z.string(),
        }),
      ),
      pro: z.boolean(),
      description: z.string(),
      // Added by the build script
      dir: z.string(),
    }),
  ),
});

// Export types inferred from our Zod schemas
export type ZodModuleMetadata = z.infer<typeof moduleMetadataSchema>;
export type ZodRegistry = z.infer<typeof registrySchema>;
