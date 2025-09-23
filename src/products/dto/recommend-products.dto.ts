import { z } from 'zod';

export const RecommendProductsInputSchema = z.object({
  query: z.string().min(2),
  limit: z.number().int().positive().max(24).optional(),
  filters: z
    .object({
      priceMin: z.number().nonnegative().optional(),
      priceMax: z.number().positive().optional(),
      category: z.string().min(1).optional(),
      inStock: z.boolean().optional(),
    })
    .refine(
      (f) =>
        !f ||
        f.priceMin === undefined ||
        f.priceMax === undefined ||
        f.priceMin <= f.priceMax,
      'priceMin must be <= priceMax',
    )
    .optional(),
});

export type RecommendProductsInput = z.infer<
  typeof RecommendProductsInputSchema
>;
