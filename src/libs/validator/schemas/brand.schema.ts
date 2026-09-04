import { z } from 'zod';

const slugSchema = z
    .string()
    .regex(/^[a-z0-9-]+$/, 'اسلاگ باید فقط شامل حروف انگلیسی کوچک، عدد و خط تیره باشد')
    .optional()
    .or(z.literal(''));

export const brandValidationSchema = z.object({
    name: z.string({ message: 'نام برند الزامی است' }),
    description: z.string({ message: 'توضیحات برند الزامی است' }),
    slug: slugSchema,
    media_id: z.string({ message: 'تصویر الزامی است' })
});

export const brandEditValidationSchema = z.object({
    name: z.string({ message: 'نام برند الزامی است' }),
    description: z.string({ message: 'توضیحات برند الزامی است' }),
    slug: slugSchema
});
