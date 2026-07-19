import { z } from 'zod';

export const productValidationSchema = z.object({
    description: z.string({ message: 'توضیحات محصول الزامی است' }),
    name: z.string({ message: 'نام محصول الزامی است' }),
    en_title: z.string({ message: 'نام انگلیسی محصول الزامی است' }),
    is_second_hand: z.boolean({ message: 'اجباری' }),
    brand_id: z.string({ message: 'برند محصول الزامی است' }).min(1, 'لطفا  یک  برند انتخاب کنید'),
    category_id: z.string({ message: 'دسته بندی محصول الزامی است' }).min(1, 'لطفا  یک دسته بندی انتخاب کنید')
});

export const galleryValidationSchema = z.object({
    media_id: z.string({ message: 'عکس الزامی است' })
});

export const ProductVariantSchema = z.object({
    price: z.coerce.number({ invalid_type_error: 'قیمت محصول الزامی است' }).min(0, 'لطفا قیمت را به درستی وارد کنید'),
    quantity: z.coerce
        .number({ invalid_type_error: 'تعداد محصول الزامی است' })
        .min(0, 'لطفا تعداد را به درستی وارد کنید'),
    label: z.string({ message: 'برچسب محصول الزامی است' }),
    key: z.string({ message: 'شناسه محصول الزامی است' }),
    value: z.string({ message: 'مقدار شناسه محصول الزامی است' }),
    warranty: z.string({ message: 'گارانتی محصول الزامی است' })
});

export const ProductAttrSchema = z.object({
    label: z.string({ message: 'برچسب محصول الزامی است' }),
    value: z.string({ message: 'مقدار شناسه محصول الزامی است' })
});
