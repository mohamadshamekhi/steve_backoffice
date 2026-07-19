import { z } from 'zod';
import { phoneRegex } from '../regex';

const persianDigitsRegex = /[۰-۹]/;

export const userSchema = z.object({
    phone_number: z
        .string({ required_error: 'وارد کردن شماره تماس الزامی است' })
        .regex(phoneRegex, 'شماره تلفن معتبر نمیباشد و باید فقط شامل اعداد انگلیسی باشد')
        .refine((val) => !persianDigitsRegex.test(val), {
            message: 'شماره تلفن نمی‌تواند شامل اعداد فارسی باشد'
        }),
    name: z.string({ required_error: 'وارد کردن نام الزامی است' }).min(2, 'نام باید حداقل ۲ کاراکتر باشد')
});
