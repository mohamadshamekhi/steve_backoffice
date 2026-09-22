import {
    CashDirection,
    CashRefType,
    ExpenseCategory,
    PaymentMethod
} from 'libs/models/accounting.model';
import { BadgeColor } from 'libs/ui/badge/badge.types';

/* ---------------------------------- ACL ---------------------------------- */

export const EXPENSE_LIST = 'expense:list';
export const EXPENSE_VIEW = 'expense:view';
export const EXPENSE_CREATE = 'expense:create';
export const EXPENSE_UPDATE = 'expense:update';
export const EXPENSE_DELETE = 'expense:delete';

export const CASH_VIEW = 'cash:view';
export const CASH_CREATE = 'cash:create';
export const CASH_DELETE = 'cash:delete';

export const SALES_RETURN_LIST = 'sales_return:list';
export const SALES_RETURN_VIEW = 'sales_return:view';
export const SALES_RETURN_CREATE = 'sales_return:create';
export const SALES_RETURN_REFUND = 'sales_return:refund';

export const REPORT_CASH = 'report:cash';
export const REPORT_PROFIT_LOSS = 'report:profit_loss';
export const REPORT_SUPPLIER_LEDGER = 'report:supplier_ledger';

/* --------------------------------- labels -------------------------------- */

export const EXPENSE_CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: BadgeColor }> = {
    rent: { label: 'اجاره', color: 'primary' },
    salary: { label: 'حقوق و دستمزد', color: 'info' },
    utilities: { label: 'قبوض', color: 'warning' },
    shipping: { label: 'حمل و نقل', color: 'info' },
    marketing: { label: 'تبلیغات', color: 'primary' },
    tax: { label: 'مالیات و عوارض', color: 'error' },
    fee: { label: 'کارمزد بانک/درگاه', color: 'warning' },
    supplies: { label: 'ملزومات مصرفی', color: 'light' },
    repair: { label: 'تعمیر و نگهداری', color: 'light' },
    other: { label: 'سایر', color: 'light' }
};

export const EXPENSE_CATEGORY_OPTIONS = (Object.keys(EXPENSE_CATEGORY_CONFIG) as ExpenseCategory[]).map((value) => ({
    value,
    label: EXPENSE_CATEGORY_CONFIG[value].label
}));

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string }> = {
    cash: { label: 'نقد' },
    card: { label: 'کارتخوان / کارت به کارت' },
    gateway: { label: 'درگاه آنلاین' },
    transfer: { label: 'حواله / شبا' },
    credit: { label: 'نسیه' },
    other: { label: 'سایر' }
};

export const PAYMENT_METHOD_OPTIONS = (Object.keys(PAYMENT_METHOD_CONFIG) as PaymentMethod[]).map((value) => ({
    value,
    label: PAYMENT_METHOD_CONFIG[value].label
}));

export const paymentMethodLabel = (method?: PaymentMethod | null) =>
    method ? (PAYMENT_METHOD_CONFIG[method]?.label ?? method) : '-';

export const CASH_DIRECTION_CONFIG: Record<CashDirection, { label: string; color: BadgeColor }> = {
    in: { label: 'دریافت', color: 'success' },
    out: { label: 'پرداخت', color: 'error' }
};

export const CASH_DIRECTION_OPTIONS = (Object.keys(CASH_DIRECTION_CONFIG) as CashDirection[]).map((value) => ({
    value,
    label: CASH_DIRECTION_CONFIG[value].label
}));

export const CASH_REF_TYPE_CONFIG: Record<CashRefType, { label: string }> = {
    order: { label: 'سفارش' },
    purchase: { label: 'فاکتور خرید' },
    expense: { label: 'هزینه' },
    sales_return: { label: 'مرجوعی' },
    manual: { label: 'دستی' }
};

export const CASH_REF_TYPE_OPTIONS = (Object.keys(CASH_REF_TYPE_CONFIG) as CashRefType[]).map((value) => ({
    value,
    label: CASH_REF_TYPE_CONFIG[value].label
}));

export const cashRefLabel = (refType?: CashRefType | null) =>
    refType ? (CASH_REF_TYPE_CONFIG[refType]?.label ?? refType) : 'دستی';

export const IS_PAID_OPTIONS = [
    { value: '', label: 'همه' },
    { value: 'true', label: 'پرداخت شده' },
    { value: 'false', label: 'پرداخت نشده' }
];

/* ------------------------------- formatters ------------------------------ */

/** درصد با یک رقم اعشار؛ برای حاشیه سود که می‌تواند منفی باشد. */
export const formatPercent = (value?: number | null) =>
    `${Number(value ?? 0).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`;
