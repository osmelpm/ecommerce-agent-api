import z from 'zod';

export const UserMessageDtoSchema = z
  .object({
    message: z.string(),
    lang: z.enum(['en', 'es']).optional().default('en'),
  })
  .strict();

export type UserMessageDto = z.infer<typeof UserMessageDtoSchema>;
