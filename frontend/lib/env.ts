import zod from "zod";

const envSchema = zod.object({
  NODE_ENV: zod.enum(["development", "production", "test"]).default("development"),
  PORT: zod.coerce.number().default(3000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  throw new Error("Invalid environment variables");
}

export const env = _env.data;