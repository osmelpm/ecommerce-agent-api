import 'dotenv/config';
import * as joi from 'joi';

interface IEnvConfig {
  PORT: number;
  OPENAI_API_KEY: string;
  MODEL_NAME: string;
  RETURN_WINDOW_DAYS: number;
  ECOMMERCE_BRAND: string;
  MONGO_URI: string;
  DATABASE_NAME: string;
  EMBEDDING_MODEL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    OPENAI_API_KEY: joi.string().required(),
    MODEL_NAME: joi.string().required(),
    RETURN_WINDOW_DAYS: joi.number().default(30),
    ECOMMERCE_BRAND: joi.string().default('ShopEasy'),
    MONGO_URI: joi.string().required(),
    DATABASE_NAME: joi.string().default('ecommerce'),
    EMBEDDING_MODEL: joi.string().default('text-embedding-3-small'),
  })
  .unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: IEnvConfig = value;
