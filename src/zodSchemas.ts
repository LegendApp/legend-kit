import { z } from "zod";
import { ModuleType } from "./types";

// Define a Zod schema for ModuleType
export const moduleTypeSchema = z.enum([
  "utility",
  "browser",
  "event",
  "converter",
]) as z.ZodType<ModuleType>;

// Define a Zod schema for ModuleMetadata
export const moduleMetadataSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Version must be in semver format (x.y.z)",
  }),
  type: moduleTypeSchema,
  dependencies: z.array(z.string()),
  files: z.array(z.string()).min(1, {
    message: "At least one file must be specified",
  }),
  pro: z.boolean(),
  dir: z.string().optional(),
});

// Define a Zod schema for Registry
export const registrySchema = z.object({
  modules: z.array(moduleMetadataSchema),
});

// Export types inferred from our Zod schemas
export type ZodModuleMetadata = z.infer<typeof moduleMetadataSchema>;
export type ZodRegistry = z.infer<typeof registrySchema>;
