import { z } from 'zod';
import { phoneRegex } from '../regex';

const persianDigitsRegex = /[۰-۹]/;

export const loginSchema = z.object({
    phone_number: z
        .string({ required_error: 'وارد کردن شماره تماس الزامی است' })
        .regex(phoneRegex, 'شماره تلفن معتبر نمیباشد و باید فقط شامل اعداد انگلیسی باشد')
        .refine((val) => !persianDigitsRegex.test(val), {
            message: 'شماره تلفن نمی‌تواند شامل اعداد فارسی باشد'
        })
});

export const otpSchema = z.object({
    code: z
        .string({ required_error: 'وارد کردن کد الزامی است.' })
        .regex(/^[0-9]{5}$/, 'کد باید دقیقاً ۵ رقم و فقط شامل اعداد انگلیسی باشد')
});
