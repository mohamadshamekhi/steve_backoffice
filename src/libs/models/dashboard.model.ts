import { ExpenseCategory, PaymentMethod } from './accounting.model';
import { IVariantAttribute } from './warehouse.model';

export interface IDashboardSales {
    net_revenue: number;
    net_revenue_prev: number;
    net_profit: number;
    net_profit_prev: number;
    gross_profit: number;
    revenue: number;
    returns: number;
    net_cogs: number;
    expenses: number;
    gross_margin_percent: number;
    net_margin_percent: number;
    units_sold: number;
    order_count: number;
    order_count_prev: number;
    avg_order_value: number;
}

export interface IDashboardTrendRow {
    day: string;
    revenue: number;
    gross_profit: number;
    order_count: number;
}

export interface IDashboardInventory {
    total_stock_value: number;
    total_units: number;
    low_stock_count: number;
    out_of_stock_count: number;
    low_stock_threshold: number;
    low_stock: { product_id: string; variant_id: string; product_name: string; attributes: IVariantAttribute[]; quantity: number }[];
}

export interface IDashboardRecentOrder {
    id: string;
    user_name?: string;
    user_phone_number?: string;
    final_amount: number;
    status: string;
    created_at: string;
}

/** هر بخشی که کاربر مجوزش را ندارد `null` برمی‌گردد. */
export interface IDashboardOverview {
    period: { from: string; to: string; prev_from: string; prev_to: string };
    sales: IDashboardSales | null;
    trend: IDashboardTrendRow[] | null;
    orders_by_status: { status: string; count: number }[] | null;
    top_products: { product_id: string; product_name: string; units_sold: number; revenue: number; gross_profit: number }[] | null;
    expense_breakdown: { category: ExpenseCategory; amount: number; count: number }[] | null;
    cash: {
        total_in: number;
        total_out: number;
        balance: number;
        by_day: { day: string; total_in: number; total_out: number }[];
        by_method: { method: PaymentMethod; total_in: number }[];
    } | null;
    inventory: IDashboardInventory | null;
    suppliers: { total_debt: number; top_debtors: { supplier_id: string; supplier_name: string; balance: number }[] } | null;
    recent_orders: IDashboardRecentOrder[] | null;
    customers: { new_count: number; new_count_prev: number } | null;
    repairs: { open_count: number } | null;
}
