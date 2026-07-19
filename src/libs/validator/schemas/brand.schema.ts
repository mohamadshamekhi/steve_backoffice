import { z } from 'zod';

export const brandValidationSchema = z.object({
    name: z.string({ message: 'نام برند الزامی است' }),
    description: z.string({ message: 'توضیحات برند الزامی است' }),
    media_id: z.string({ message: 'تصویر الزامی است' })
});

export const brandEditValidationSchema = z.object({
    name: z.string({ message: 'نام برند الزامی است' }),
    description: z.string({ message: 'توضیحات برند الزامی است' })
});
