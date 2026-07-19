import { z } from 'zod';
const phoneRegex = /^(?:\+98|0098|98|0)?9\d{9}$/;

/**
 * Validator for Persian-only strings (including spaces)
 */
export const zPersianText = (errorMessage = 'فقط حروف فارسی مجاز است') =>
    z.string().refine((val) => /^[\u0600-\u06FF\s]+$/.test(val), { message: errorMessage });

/**
 * Validator for English-only strings (including spaces)
 */
export const zEnglishText = (errorMessage = 'فقط حروف انگلیسی مجاز است') =>
    z.string().refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: errorMessage });

/**
 * Validate Iranian phone number (e.g. 09123456789, +989123456789)
 */
export const zPhoneNumber = (errorMessage = 'شماره تلفن معتبر نمی‌باشد') =>
    z
        .string({ required_error: 'وارد کردن شماره تماس الزامی است' })
        .min(11, 'تعداد ارقام شماره موبایل کوتاه می‌باشد.')
        .max(11, 'شماره تماس نمی‌تواند بیشتر از ۱۱ رقم باشد.')
        .regex(phoneRegex, errorMessage);

/**
 * Validate 5-digit OTP code
 */
export const zOTPCode = (errorMessage = 'کد باید فقط شامل ارقام باشد') =>
    z
        .string({ required_error: 'وارد کردن کد الزامی است.' })
        .length(5, 'کد باید دقیقاً ۵ رقم باشد')
        .regex(/^\d{5}$/, errorMessage);
