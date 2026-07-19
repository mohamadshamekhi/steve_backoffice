import { z } from 'zod';

export const categoryValidationSchema = z.object({
    name: z.string({ message: 'نام دسته بندی الزامی است' }),
    description: z.string({ message: 'توضیحات دسته بندی الزامی است' }),
    parent_id: z.string().optional(),
    attribute_set_id: z.string().optional(),
    media_id: z.string({ message: 'تصویر الزامی است' })
});

export const categoryEditValidationSchema = z.object({
    name: z.string({ message: 'نام دسته بندی الزامی است' }),
    description: z.string({ message: 'توضیحات دسته بندی الزامی است' }),
    parent_id: z.string().optional(),
    attribute_set_id: z.string().optional()
});
