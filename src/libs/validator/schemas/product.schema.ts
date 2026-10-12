import { z } from 'zod';

export const productValidationSchema = z
    .object({
        description: z.string({ message: 'توضیحات محصول الزامی است' }),
        name: z.string({ message: 'نام محصول الزامی است' }),
        en_title: z.string({ message: 'نام انگلیسی محصول الزامی است' }),
        is_second_hand: z.boolean({ message: 'اجباری' }),
        requires_freight_shipping: z.boolean().optional(),
        brand_id: z.string().optional(),
        category_id: z.string().optional(),
        kind: z.enum(['physical', 'service']),
        sales_channels: z.array(z.enum(['website', 'in_person'])).min(1, 'حداقل یک کانال فروش باید انتخاب شود'),
        /** فقط برای خدمات؛ قیمت کالا روی واریانت ثبت می‌شود */
        price: z.coerce.number().min(0).optional()
    })
    .superRefine((values, ctx) => {
        // خدمات نه برند/دسته‌بندی لازم دارند و نه واریانت؛ قیمتشان مستقیم روی خود محصول است.
        if (values.kind === 'service') {
            if (!values.price) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['price'],
                    message: 'قیمت خدمت الزامی است'
                });
            }
            return;
        }

        if (!values.brand_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['brand_id'],
                message: 'لطفا یک برند انتخاب کنید'
            });
        }
        if (!values.category_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['category_id'],
                message: 'لطفا یک دسته بندی انتخاب کنید'
            });
        }
    });

/** Services do not need a brand or a category (the backend made both optional for kind=service). */
export const serviceValidationSchema = z.object({
    description: z.string({ message: 'توضیحات خدمت الزامی است' }),
    name: z.string({ message: 'نام خدمت الزامی است' }),
    en_title: z.string({ message: 'نام انگلیسی خدمت الزامی است' }),
    kind: z.literal('service'),
    sales_channels: z.array(z.enum(['website', 'in_person'])).min(1, 'حداقل یک کانال فروش باید انتخاب شود'),
    price: z.coerce.number({ invalid_type_error: 'قیمت خدمت الزامی است' }).min(1, 'قیمت خدمت الزامی است')
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
    warranty: z.string({ message: 'گارانتی محصول الزامی است' }),
    stock_mode: z.enum(['tracked', 'on_demand', 'none']),
    allow_backorder: z.boolean(),
    backorder_limit: z.string().optional().or(z.literal('')),
    supplier_id: z.string().optional().or(z.literal('')),
    supply_cost: z.coerce.number().min(0, 'قیمت تأمین نمی‌تواند منفی باشد')
});

export const ProductAttrSchema = z.object({
    label: z.string({ message: 'برچسب محصول الزامی است' }),
    value: z.string({ message: 'مقدار شناسه محصول الزامی است' })
});
