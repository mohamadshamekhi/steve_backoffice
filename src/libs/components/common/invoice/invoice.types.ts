export interface InvoiceItem {
    name: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice: number;
}

export interface InvoiceAddress {
    title?: string;
    province?: string;
    city?: string;
    street?: string;
    postcode?: string;
}

export interface InvoiceData {
    orderId: string;
    invoiceNumber?: string;
    createdAt: string;
    type: 'online' | 'in_person';
    customer: { name?: string; phone?: string; economicCode?: string };
    address?: InvoiceAddress;
    shippingName?: string;
    items: InvoiceItem[];
    subtotal: number;
    /** مجموع همه‌ی تخفیف‌ها (سطری، کمپین، کد تخفیف و تخفیف کل فاکتور) */
    discount?: number;
    /** کد تخفیفی که مشتری وارد کرده؛ فقط برای نمایش */
    discountCode?: string;
    shippingCost?: number;
    total: number;
    advancePaid?: number;
    paymentMethod?: string;
    note?: string;
}
