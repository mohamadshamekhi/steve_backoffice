import { z } from 'zod';

const discountType = z.enum(['percentage', 'fixed_amount'], { message: 'نوع تخفیف نامعتبر است' });

const checkDiscountValue = (
    ctx: z.RefinementCtx,
    type: 'percentage' | 'fixed_amount',
    value: number,
    path: string
) => {
    if (type === 'percentage' && (value < 1 || value > 100)) {
        ctx.addIssue({ code: 'custom', path: [path], message: 'درصد باید بین ۱ تا ۱۰۰ باشد' });
    }
    if (type === 'fixed_amount' && value <= 0) {
        ctx.addIssue({ code: 'custom', path: [path], message: 'مبلغ باید بیشتر از صفر باشد' });
    }
};

export const referralSettingsSchema = z
    .object({
        reward_threshold: z.coerce.number({ message: 'حد نصاب الزامی است' }).int().min(1, 'حد نصاب حداقل ۱ است'),
        reward_discount_type: discountType,
        reward_discount_value: z.coerce.number({ message: 'مقدار تخفیف الزامی است' }),
        reward_valid_days: z.coerce.number({ message: 'مدت اعتبار الزامی است' }).int().min(1, 'حداقل ۱ روز'),
        reward_minimum_purchase_amount: z.coerce.number().min(0, 'نمی‌تواند منفی باشد'),
        welcome_discount_enabled: z.boolean(),
        welcome_discount_type: discountType,
        welcome_discount_value: z.coerce.number(),
        welcome_valid_days: z.coerce.number().int()
    })
    .superRefine((values, ctx) => {
        checkDiscountValue(
            ctx,
            values.reward_discount_type,
            values.reward_discount_value,
            'reward_discount_value'
        );

        if (values.welcome_discount_enabled) {
            checkDiscountValue(
                ctx,
                values.welcome_discount_type,
                values.welcome_discount_value,
                'welcome_discount_value'
            );
            if (!Number.isInteger(values.welcome_valid_days) || values.welcome_valid_days < 1) {
                ctx.addIssue({ code: 'custom', path: ['welcome_valid_days'], message: 'حداقل ۱ روز' });
            }
        }
    });

export type ReferralSettingsFormValues = z.input<typeof referralSettingsSchema>;
