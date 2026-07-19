import { z } from 'zod';

export const attributesSchema = z.object({
    name: z.string({ message: ' نام الزامی است' }),
    attribute_definition_ids: z.array(z.string()).min(1, 'لطفا حداقل یک ویژگی انتخاب کنید')
});
