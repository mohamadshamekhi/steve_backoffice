import { z } from 'zod';

export const blogValidationSchema = z.object({
    title: z.string({ message: 'عنوان الزامی است' }),
    slug: z.string({ message: 'اسلاگ الزامی است' }),
    body: z.string({ message: 'توضیحات مقاله الزامی است' }),
    media_id: z.string({ message: 'عکس مقاله الزامی است' }),
    alt: z.string({ message: 'متن جایگزین تصویر الزامی است' }),
    tags: z.array(z.string()).min(1, 'حداقل یک تگ الزامی است'),
    meta_description: z.string({ message: 'توضیحات متا الزامی است' }),
    is_published: z.boolean()
});

export const blogEditValidationSchema = z.object({
    title: z.string({ message: 'عنوان الزامی است' }),
    slug: z.string({ message: 'اسلاگ الزامی است' }),
    body: z.string({ message: 'توضیحات مقاله الزامی است' }),
    alt: z.string({ message: 'متن جایگزین تصویر الزامی است' }),
    tags: z.array(z.string()).min(1, 'حداقل یک تگ الزامی است'),
    meta_description: z.string({ message: 'توضیحات متا الزامی است' }),
    is_published: z.boolean()
});
