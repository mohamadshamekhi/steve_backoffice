import { IPagination, IVariantAttribute } from './warehouse.model';

export type ExpenseCategory =
    | 'rent'
    | 'salary'
    | 'utilities'
    | 'shipping'
    | 'marketing'
    | 'tax'
    | 'fee'
    | 'supplies'
    | 'repair'
    | 'other';

export type PaymentMethod = 'cash' | 'card' | 'gateway' | 'transfer' | 'credit' | 'other';

export type CashDirection = 'in' | 'out';

export type CashRefType = 'order' | 'purchase' | 'expense' | 'sales_return' | 'manual';

/* -------------------------------- expense -------------------------------- */

export interface IExpense {
    id: string;
    title: string;
    category: ExpenseCategory;
    amount: number;
    supplier_id?: string;
    payment_method?: PaymentMethod;
    is_paid: boolean;
    spent_at: string;
    note?: string;
    attachment?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface IExpensePayload {
    title: string;
    category: ExpenseCategory;
    amount: number;
    supplier_id?: string;
    payment_method?: PaymentMethod;
    is_paid?: boolean;
    spent_at?: string;
    note?: string;
    attachment?: string;
}

export interface IExpenseListResponse {
    expenses: IExpense[];
    /** مجموع کل فیلتر جاری، نه فقط صفحه‌ی نمایش‌داده‌شده */
    total_amount: number;
    pagination: IPagination;
}

/* ---------------------------------- cash --------------------------------- */

export interface ICashTransaction {
    id: string;
    direction: CashDirection;
    method: PaymentMethod;
    amount: number;
    description?: string;
    ref_type?: CashRefType;
    ref_id?: string;
    supplier_id?: string;
    /** تراکنش خودکار سیستم؛ قابل حذف نیست */
    is_auto?: boolean;
    occurred_at: string;
    created_by?: string;
    created_at: string;
}

export interface ICashSummary {
    total_in: number;
    total_out: number;
    balance: number;
}

export interface ICashListResponse {
    transactions: ICashTransaction[];
    summary: ICashSummary;
    pagination: IPagination;
}

export interface ICashPayload {
    direction: CashDirection;
    method?: PaymentMethod;
    amount: number;
    description?: string;
    supplier_id?: string;
    occurred_at?: string;
}

export interface ICashMethodRow {
    method: PaymentMethod;
    total_in: number;
    total_out: number;
    balance: number;
}

export interface ICashDayRow {
    day: string;
    total_in: number;
    total_out: number;
    balance: number;
}

export interface ICashReport {
    summary: ICashSummary;
    by_method: ICashMethodRow[];
    by_day: ICashDayRow[];
}

/* ------------------------------ sales return ----------------------------- */

export interface ISalesReturnItem {
    product_id?: string;
    variant_id: string;
    product_name?: string;
    variant_attributes?: IVariantAttribute[];
    quantity: number;
    unit_price: number;
    unit_cost: number;
    restock: boolean;
}

export interface ISalesReturn {
    id: string;
    order_id: string;
    user_id?: string;
    items: ISalesReturnItem[];
    refund_amount: number;
    items_amount: number;
    returned_cost: number;
    refund_method?: PaymentMethod;
    is_refunded: boolean;
    reason?: string;
    note?: string;
    returned_at: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ISalesReturnPayload {
    order_id: string;
    items: { variant_id: string; quantity: number; restock?: boolean }[];
    refund_amount?: number;
    refund_method?: PaymentMethod;
    is_refunded?: boolean;
    reason?: string;
    note?: string;
    returned_at?: string;
}

export interface ISalesReturnSummary {
    count: number;
    refund_amount: number;
    items_amount: number;
    returned_cost: number;
}

export interface ISalesReturnListResponse {
    sales_returns: ISalesReturn[];
    summary: ISalesReturnSummary;
    pagination: IPagination;
}

/* -------------------------------- reports -------------------------------- */

export interface IExpenseCategoryRow {
    category: ExpenseCategory;
    amount: number;
    count: number;
}

export interface IProfitLossReport {
    from?: string;
    to?: string;
    units_sold: number;
    revenue: number;
    returns: number;
    net_revenue: number;
    cogs: number;
    returned_cost: number;
    net_cogs: number;
    gross_profit: number;
    expenses: number;
    expense_breakdown?: IExpenseCategoryRow[];
    net_profit: number;
    gross_margin_percent: number;
    net_margin_percent: number;
}

export interface ISupplierLedgerRow {
    supplier_id: string;
    supplier_name?: string;
    invoice_count: number;
    total_purchased: number;
    total_paid: number;
    /** بدهی به تأمین‌کننده؛ منفی یعنی پیش‌پرداخت */
    balance: number;
    last_purchase_at?: string;
}

export interface ISupplierLedgerReport {
    rows: ISupplierLedgerRow[];
    total_debt: number;
    total_purchased: number;
    total_paid: number;
}
