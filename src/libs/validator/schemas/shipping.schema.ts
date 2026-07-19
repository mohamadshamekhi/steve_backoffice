import { z } from 'zod';

export const shippingValidationSchema = z.object({
    name: z.string({ message: 'نام الزامی است' }),
    description: z.string({ message: 'توضیحات  الزامی است' }),
    cost: z.string({ message: 'هزینه الزامی است' })
});
