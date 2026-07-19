import { z } from 'zod';

export const attributeDefinitionSchema = z.object({
    name: z.string({ message: 'نام الزامی است' }),
    key: z.string({ message: 'شناسه الزامی است' }),
    unit: z.string({ message: 'واحد  الزامی است' })
});
