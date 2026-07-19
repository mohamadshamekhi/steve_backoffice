import { z } from 'zod';

export const bannerValidationSchema = z.object({
    title: z.string({ message: 'عنوان الزامی است' }).min(1, { message: 'عنوان الزامی است' }),
    alt_text: z.string({ message: 'متن جایگزین الزامی است' }).min(1, { message: 'متن جایگزین الزامی است' }),
    link: z.string({ message: 'لینک الزامی است' }).min(1, { message: 'لینک الزامی است' }),
    location: z.enum(['top', 'middle', 'bottom'], { message: 'موقعیت باید top یا middle یا bottom باشد' }),
    media_id: z.string({ message: 'تصویر الزامی است' }).min(1, { message: 'تصویر الزامی است' }),
    sort_order: z.number({ message: 'ترتیب الزامی است' }).int().min(0, { message: 'ترتیب باید عدد صحیح مثبت باشد' }),
    is_active: z.boolean({ message: 'وضعیت فعال بودن الزامی است' })
});

export const bannerEditValidationSchema = z.object({
    title: z.string({ message: 'عنوان الزامی است' }).min(1, { message: 'عنوان الزامی است' }).optional(),
    alt_text: z.string({ message: 'متن جایگزین الزامی است' }).min(1, { message: 'متن جایگزین الزامی است' }).optional(),
    link: z.string({ message: 'لینک الزامی است' }).min(1, { message: 'لینک الزامی است' }).optional(),
    location: z.enum(['top', 'middle', 'bottom'], { message: 'موقعیت باید top یا middle یا bottom باشد' }).optional(),
    media_id: z.string({ message: 'تصویر الزامی است' }).min(1, { message: 'تصویر الزامی است' }).nullable().optional(),
    sort_order: z
        .number({ message: 'ترتیب الزامی است' })
        .int()
        .min(0, { message: 'ترتیب باید عدد صحیح مثبت باشد' })
        .optional(),
    is_active: z.boolean({ message: 'وضعیت فعال بودن الزامی است' }).optional()
});
