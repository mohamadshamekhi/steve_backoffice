import { z } from 'zod';

export const attributeSchema = z.object({
    key: z.string({ message: 'ویژگی محصول الزامی است' }),
    value: z.string({ message: 'مقدار ویژگی محصول الزامی است' })
});
