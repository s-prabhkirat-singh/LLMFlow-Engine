import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  RABBITMQ_URL: z.string().min(1).default('amqp://localhost:5672'),
  RABBITMQ_QUEUE_NAME: z.string().min(1).default('pipeline.jobs'),
  RABBITMQ_PREFETCH: z.coerce.number().int().positive().default(10),
  JOB_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(2)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
