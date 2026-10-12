import { z } from 'zod';

export const priceReviewSettingsSchema = z.object({
    interval_days: z.coerce.number({ message: 'بازه بازبینی الزامی است' }).int().min(1, 'حداقل ۱ روز')
});

export type PriceReviewSettingsFormValues = z.input<typeof priceReviewSettingsSchema>;
