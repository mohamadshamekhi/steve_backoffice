import { z } from 'zod';

export const birthdaySettingsSchema = z
    .object({
        enabled: z.boolean(),
        days_before: z.coerce
            .number({ message: 'تعداد روز الزامی است' })
            .int('عدد صحیح وارد کنید')
            .min(0, 'حداقل ۰ (همان روز تولد)')
            .max(30, 'حداکثر ۳۰ روز'),
        send_hour: z.coerce.number().int().min(0).max(23, 'ساعت نامعتبر است'),
        discount_type: z.enum(['percentage', 'fixed_amount'], { message: 'نوع تخفیف نامعتبر است' }),
        discount_value: z.coerce.number({ message: 'مقدار تخفیف الزامی است' }),
        valid_days: z.coerce
            .number({ message: 'مدت اعتبار الزامی است' })
            .int('عدد صحیح وارد کنید')
            .min(1, 'حداقل ۱ روز')
            .max(365, 'حداکثر ۳۶۵ روز'),
        minimum_purchase_amount: z.coerce.number().min(0, 'نمی‌تواند منفی باشد')
    })
    .superRefine((values, ctx) => {
        if (values.discount_type === 'percentage' && (values.discount_value < 1 || values.discount_value > 100)) {
            ctx.addIssue({ code: 'custom', path: ['discount_value'], message: 'درصد باید بین ۱ تا ۱۰۰ باشد' });
        }
        if (values.discount_type === 'fixed_amount' && values.discount_value <= 0) {
            ctx.addIssue({ code: 'custom', path: ['discount_value'], message: 'مبلغ باید بیشتر از صفر باشد' });
        }
    });
