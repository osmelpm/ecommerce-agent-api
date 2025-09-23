import { z } from 'zod';

export const CreateTicketDtoSchema = z.object({
  summary: z.string().min(5),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  userEmail: z.email().optional(),
  orderId: z.string().optional(),
});

export type CreateTicketDto = z.infer<typeof CreateTicketDtoSchema>;
