import { z } from 'zod';
const persianDigitsRegex = /[۰-۹]/;

import { phoneRegex } from '../regex';

export const adminValidationSchema = z.object({
    name: z.string({ message: 'نام الزامی است' }),
    address: z.string({ message: 'آدرس  الزامی است' }),
    phone_number: z
        .string({ required_error: 'وارد کردن شماره تماس الزامی است' })
        .regex(phoneRegex, 'شماره تلفن معتبر نمیباشد و باید فقط شامل اعداد انگلیسی باشد')
        .refine((val) => !persianDigitsRegex.test(val), {
            message: 'شماره تلفن نمی‌تواند شامل اعداد فارسی باشد'
        }),
    roles: z.array(z.string()).min(1, 'لطفا حداقل یک نقش انتخاب کنید'),
    is_active: z.boolean().optional()
});
