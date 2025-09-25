import { z } from 'zod';

export const RecommendProductsInputSchema = z.object({
  query: z.string().min(2),
  limit: z.number().int().positive().max(24).optional().default(5),
});

export type RecommendProductsInput = z.infer<
  typeof RecommendProductsInputSchema
>;
