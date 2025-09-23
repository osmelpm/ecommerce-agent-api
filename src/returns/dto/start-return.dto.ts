import { z } from 'zod';

export const StartReturnDtoSchema = z
  .object({
    orderId: z.string().min(1),
    itemIds: z
      .array(
        z.object({
          itemId: z.string().min(1),
          reason: z.string().min(5),
          quantity: z.number().int().positive().optional().default(1),
        }),
      )
      .min(1),
  })
  .strict();

export type StartReturnDto = z.infer<typeof StartReturnDtoSchema>;
