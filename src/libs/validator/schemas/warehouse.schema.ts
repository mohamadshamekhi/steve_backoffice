import { z } from 'zod';

export const supplierValidationSchema = z.object({
    name: z
        .string({ message: 'نام تأمین‌کننده الزامی است' })
        .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
        .max(150, 'نام حداکثر ۱۵۰ کاراکتر است'),
    shop_name: z.string().max(150, 'نام مغازه حداکثر ۱۵۰ کاراکتر است').optional().or(z.literal('')),
    phone_number: z
        .string()
        .regex(/^09\d{9}$/, 'شماره تلفن باید به شکل 09xxxxxxxxx باشد')
        .optional()
        .or(z.literal('')),
    address: z.string().max(500, 'آدرس حداکثر ۵۰۰ کاراکتر است').optional().or(z.literal('')),
    note: z.string().max(1000, 'یادداشت حداکثر ۱۰۰۰ کاراکتر است').optional().or(z.literal('')),
    is_active: z.boolean().optional()
});

export const purchaseItemSchema = z.object({
    product_id: z.string().min(1, 'انتخاب محصول الزامی است'),
    variant_id: z.string().min(1, 'انتخاب واریانت الزامی است'),
    quantity: z.coerce.number().min(1, 'تعداد حداقل ۱ است'),
    unit_cost: z.coerce.number().min(1, 'قیمت واحد نمی‌تواند صفر باشد'),
    add_to_stock: z.boolean()
});

export const purchaseValidationSchema = z.object({
    supplier_id: z.string().min(1, 'انتخاب تأمین‌کننده الزامی است'),
    invoice_number: z.string().optional().or(z.literal('')),
    items: z.array(purchaseItemSchema).min(1, 'حداقل یک قلم باید ثبت شود'),
    paid_amount: z.coerce.number().min(0, 'مبلغ پرداختی نمی‌تواند منفی باشد'),
    note: z.string().optional().or(z.literal('')),
    order_id: z.string().optional().or(z.literal('')),
    purchased_at: z.string().optional().or(z.literal(''))
});

export const inventoryAdjustSchema = z.object({
    direction: z.enum(['increase', 'decrease']),
    quantity: z.coerce.number().min(1, 'تعداد باید حداقل ۱ باشد'),
    unit_cost: z.coerce.number().min(0).optional(),
    note: z.string().min(1, 'ثبت دلیل اصلاح الزامی است').max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر است')
});

export const stockConfigSchema = z.object({
    stock_mode: z.enum(['tracked', 'on_demand', 'none']),
    allow_backorder: z.boolean(),
    backorder_limit: z.string().optional().or(z.literal('')),
    supplier_id: z.string().optional().or(z.literal('')),
    supply_cost: z.coerce.number().min(0, 'قیمت تأمین نمی‌تواند منفی باشد')
});
