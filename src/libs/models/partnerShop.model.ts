export type PartnerShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IPartnerShopMe {
    has_partnership: boolean;
    status: PartnerShopStatus;
    discount_percent: number;
    company_name: string;
}

export interface IPartnerShopVariant {
    id: string;
    price: number;
    partner_price: number;
    discount_amount: number;
    quantity: number;
    warranty: string;
}

export interface IPartnerShopProduct {
    id: string;
    name: string;
    slug: string;
    url: string;
    partner_eligible: boolean;
    applied_percent: number;
    variants: IPartnerShopVariant[];
}

export interface IPartnerShopProductsResponse {
    pagination: { page_size: number; page_number: number; total: number };
    products: IPartnerShopProduct[];
}

export interface IPartnerShopCartItem {
    product_id: string;
    variant_id: string;
    product_name: string;
    url: string;
    quantity: number;
    base_price: number;
    unit_price: number;
    line_total: number;
    in_stock: boolean;
}

export interface IPartnerShopCart {
    cart_id: string;
    subtotal: number;
    saved_total: number;
    items: IPartnerShopCartItem[];
}

export type PartnerShopPaymentMethod = 'online' | 'in_person';

export interface IPartnerShopCheckoutResponse {
    order_id: string;
    payment_method: PartnerShopPaymentMethod;
    payment_url?: string;
    gateway_transaction_id?: string;
}

export interface IPartnerShopVerifyResponse {
    status: string;
    tracking_code: string;
    message: string;
}

export interface IPartnerShopOrderItem {
    ProductID: string;
    VariantID: string;
    Quantity: number;
    ProductName: string;
    PriceAtTime: number;
}

export interface IPartnerShopOrder {
    _id: string;
    user_id: string;
    status: string;
    subtotal_amount: number;
    final_amount: number;
    created_at: string;
    items: IPartnerShopOrderItem[];
}

export interface IPartnerShopOrdersResponse {
    pagination: { page_size: number; page_number: number; total: number };
    orders: IPartnerShopOrder[];
}
