export type ProductKind = 'physical' | 'service';
export type SalesChannel = 'website' | 'in_person';
export type StockMode = 'tracked' | 'on_demand' | 'none';

export type PurchaseStatus = 'draft' | 'confirmed' | 'canceled';
export type PaymentState = 'unpaid' | 'partial' | 'paid';

export type MovementType =
    | 'purchase_in'
    | 'sale_out'
    | 'return_in'
    | 'adjustment'
    | 'external_supply'
    | 'service_sale';

export type MovementRefType = 'order' | 'purchase' | 'manual' | 'stocktake';

export type ProfitGroupBy = 'day' | 'product' | 'supplier';

export interface IPagination {
    page_number: number;
    page_size: number;
    total: number;
}

export interface IVariantAttribute {
    key: string;
    value: string;
    label: string;
}

export interface ISupplier {
    id: string;
    name: string;
    shop_name: string;
    phone_number: string;
    address: string;
    note: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ISupplierPayload {
    name: string;
    shop_name?: string;
    phone_number?: string;
    address?: string;
    note?: string;
    is_active?: boolean;
}

export interface IPurchaseItem {
    product_id: string;
    variant_id: string;
    product_name?: string;
    variant_attributes?: IVariantAttribute[];
    quantity: number;
    unit_cost: number;
    total_cost?: number;
    add_to_stock: boolean;
}

export interface IPurchase {
    id: string;
    supplier_id: string;
    supplier_name: string;
    invoice_number: string;
    items: IPurchaseItem[];
    total_amount: number;
    paid_amount: number;
    payment_state: PaymentState;
    status: PurchaseStatus;
    note: string;
    order_id: string;
    purchased_at: string;
    confirmed_at?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface IStockRow {
    product_id: string;
    product_name: string;
    variant_id: string;
    attributes: IVariantAttribute[];
    stock_mode: StockMode;
    quantity: number;
    avg_cost: number;
    price: number;
    stock_value: number;
    potential_profit: number;
}

export interface IInventoryMovement {
    id: string;
    product_id: string;
    variant_id: string;
    product_name: string;
    kind: ProductKind;
    type: MovementType;
    variant_attributes: IVariantAttribute[];
    quantity: number;
    unit_cost: number;
    unit_price: number;
    total_cost: number;
    total_price: number;
    profit: number;
    ref_type: MovementRefType | '';
    ref_id: string;
    supplier_id: string;
    quantity_after: number;
    avg_cost_after: number;
    note: string;
    created_by: string;
    created_at: string;
}

export interface IStockConfigPayload {
    product_id: string;
    variant_id: string;
    stock_mode?: StockMode;
    allow_backorder?: boolean;
    backorder_limit?: number | null;
    supplier_id?: string;
    supply_cost?: number;
    avg_cost?: number | null;
}

export interface IProfitRow {
    key: string;
    label: string;
    units_sold: number;
    revenue: number;
    cost: number;
    gross_profit: number;
}

export interface IProfitReport {
    summary: IProfitRow;
    rows: IProfitRow[] | null;
}
