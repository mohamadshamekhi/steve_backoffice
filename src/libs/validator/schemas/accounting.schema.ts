import { z } from 'zod';

export const expenseValidationSchema = z.object({
    title: z
        .string({ message: 'عنوان هزینه الزامی است' })
        .min(2, 'عنوان باید حداقل ۲ کاراکتر باشد')
        .max(200, 'عنوان حداکثر ۲۰۰ کاراکتر است'),
    category: z.enum(
        ['rent', 'salary', 'utilities', 'shipping', 'marketing', 'tax', 'fee', 'supplies', 'repair', 'other'],
        { message: 'انتخاب دسته‌ی هزینه الزامی است' }
    ),
    amount: z.coerce.number({ message: 'مبلغ الزامی است' }).min(1, 'مبلغ نمی‌تواند صفر باشد'),
    supplier_id: z.string().optional().or(z.literal('')),
    payment_method: z.enum(['cash', 'card', 'gateway', 'transfer', 'credit', 'other']).optional().or(z.literal('')),
    is_paid: z.boolean().optional(),
    spent_at: z.string().optional().or(z.literal('')),
    note: z.string().max(1000, 'یادداشت حداکثر ۱۰۰۰ کاراکتر است').optional().or(z.literal('')),
    attachment: z.string().optional().or(z.literal(''))
});

export const cashTransactionValidationSchema = z.object({
    direction: z.enum(['in', 'out'], { message: 'نوع تراکنش الزامی است' }),
    method: z.enum(['cash', 'card', 'gateway', 'transfer', 'credit', 'other'], {
        message: 'روش پرداخت الزامی است'
    }),
    amount: z.coerce.number({ message: 'مبلغ الزامی است' }).min(1, 'مبلغ نمی‌تواند صفر باشد'),
    description: z.string().max(500, 'توضیح حداکثر ۵۰۰ کاراکتر است').optional().or(z.literal('')),
    occurred_at: z.string().optional().or(z.literal(''))
});

export const salesReturnValidationSchema = z.object({
    order_id: z.string().min(1, 'انتخاب سفارش الزامی است'),
    items: z
        .array(
            z.object({
                variant_id: z.string().min(1),
                quantity: z.coerce.number().min(1, 'تعداد حداقل ۱ است'),
                restock: z.boolean()
            })
        )
        .min(1, 'حداقل یک قلم باید برگشت داده شود'),
    refund_amount: z.coerce.number().min(0, 'مبلغ استرداد نمی‌تواند منفی باشد').optional(),
    refund_method: z.enum(['cash', 'card', 'gateway', 'transfer', 'credit', 'other']).optional().or(z.literal('')),
    is_refunded: z.boolean().optional(),
    reason: z.string().max(500, 'دلیل حداکثر ۵۰۰ کاراکتر است').optional().or(z.literal('')),
    note: z.string().max(1000, 'یادداشت حداکثر ۱۰۰۰ کاراکتر است').optional().or(z.literal(''))
});
