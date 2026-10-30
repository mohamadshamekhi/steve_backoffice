import { ProductKind } from 'libs/models/warehouse.model';

export const ORDER_EDIT = 'order:edit';

// entity.OrderItem در بک‌اند json tag ندارد، پس فیلدها PascalCase می‌آیند
export interface OrderItem {
    ProductID: string;
    VariantID: string;
    Quantity: number;
    ProductName: string;
    VariantAttributes: { key: string; value: string; label: string }[] | null;
    PriceAtTime: number;
    DiscountAmount?: number;
    IsCustom?: boolean;
    Kind?: ProductKind;
    CostAtTime?: number;
    ProductThumbnailURL?: string;
}

export interface ShippingAddress {
    title: string;
    province: string;
    city: string;
    street: string;
    postcode: string;
}

export interface Shipping {
    name: string;
    description: string;
    cost: number;
}

export interface Payment {
    id: string;
    user_id: string;
    order_id: string;
    amount: number;
    gateway: string;
    status: string;
    gateway_transaction_id: string;
    tracking_code?: string;
    masked_card_number?: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface OrderSnapshot {
    user_id: string;
    items: OrderItem[] | null;
    shipping_address: ShippingAddress;
    subtotal_amount: number;
    shipping_amount: number;
    manual_discount_amount: number;
    final_amount: number;
}

export type OrderEditChange = 'items' | 'user_id' | 'shipping_address' | 'shipping_amount' | 'manual_discount_amount';

export interface OrderEdit {
    id: string;
    edited_by: string;
    edited_at: string;
    reason: string;
    changes: OrderEditChange[] | null;
    before: OrderSnapshot;
    after: OrderSnapshot;
    /** مثبت = دریافت از مشتری، منفی = پرداخت به مشتری، ۰/خالی = ثبت نشده */
    cash_difference?: number;
}

export interface OrderProps {
    id: string;
    status: string;
    user_id: string;
    user_name: string;
    user_phone_number: string;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    shipping: Shipping;
    payments: Payment[];
    subtotal_amount: number;
    shipping_amount: number;
    final_amount: number;
    applied_discounts: { discount_id: string; discount_code?: string; amount: number }[];
    /** کل تخفیف فاکتور (کد تخفیف + کمپین + تخفیف دستی) */
    total_discount_amount?: number;
    /** تخفیف کل فاکتور حضوری */
    manual_discount?: number;
    is_edited?: boolean;
    /** سبد این سفارش آیتم باربری داشته؛ هزینه ارسال موقع تحویل نقدی گرفته می‌شود */
    is_post_pay_shipping?: boolean;
    edits?: OrderEdit[];
    /** کد رهگیری مرسوله؛ موقع تغییر وضعیت به «ارسال شده» ثبت می‌شود */
    tracking_code?: string;
    shipped_at?: string;
    created_at: string;
    updated_at: string;
}

export const formatPrice = (price: number): string => price.toLocaleString('fa-IR') + ' تومان';

export const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

export const variantLabel = (item: OrderItem) =>
    item.VariantAttributes?.map((a) => a.label).join('، ') ?? '';

export const lineNet = (item: Pick<OrderItem, 'PriceAtTime' | 'Quantity' | 'DiscountAmount'>) =>
    item.PriceAtTime * item.Quantity - (item.DiscountAmount || 0);
