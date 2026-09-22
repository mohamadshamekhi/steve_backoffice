import {
    MovementType,
    PaymentState,
    ProductKind,
    PurchaseStatus,
    SalesChannel,
    StockMode
} from 'libs/models/warehouse.model';
import { BadgeColor } from 'libs/ui/badge/badge.types';

/* ---------------------------------- ACL ---------------------------------- */

export const SUPPLIER_LIST = 'supplier:list';
export const SUPPLIER_VIEW = 'supplier:view';
export const SUPPLIER_CREATE = 'supplier:create';
export const SUPPLIER_UPDATE = 'supplier:update';
export const SUPPLIER_DELETE = 'supplier:delete';

export const PURCHASE_LIST = 'purchase:list';
export const PURCHASE_VIEW = 'purchase:view';
export const PURCHASE_CREATE = 'purchase:create';
export const PURCHASE_UPDATE = 'purchase:update';
export const PURCHASE_CONFIRM = 'purchase:confirm';
export const PURCHASE_CANCEL = 'purchase:cancel';

export const INVENTORY_VIEW = 'inventory:view';
export const INVENTORY_ADJUST = 'inventory:adjust';
export const INVENTORY_UPDATE_STOCK_CONFIG = 'inventory:update_stock_config';

export const REPORT_PROFIT = 'report:profit';
export const REPORT_INVENTORY = 'report:inventory';

/* ------------------------------- formatters ------------------------------ */

export const PAGE_SIZE_OPTIONS = [1, 10, 15, 25, 50, 100, 150, 200];

export const DEFAULT_PAGE_SIZE = 25;

export const formatNumber = (value?: number | null) => Number(value ?? 0).toLocaleString('fa-IR');

export const formatToman = (value?: number | null) => `${formatNumber(value)} تومان`;

/** Signed amount with an explicit sign, always shown LTR-safe for Persian digits. */
export const formatSigned = (value?: number | null) => {
    const num = Number(value ?? 0);
    return `${num > 0 ? '+' : num < 0 ? '−' : ''}${formatNumber(Math.abs(num))}`;
};

/** Tailwind class for signed values: negative → red, positive → green. */
export const signedClass = (value?: number | null) => {
    const num = Number(value ?? 0);
    if (num > 0) return 'text-success-600 dark:text-success-500';
    if (num < 0) return 'text-error-600 dark:text-error-500';
    return 'text-gray-500';
};

export const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('fa-IR') : '-');

export const formatDateTime = (date?: string | null) =>
    date
        ? `${new Date(date).toLocaleDateString('fa-IR')} - ${new Date(date).toLocaleTimeString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit'
          })}`
        : '-';

/** RFC3339/ISO → YYYY-MM-DD for query params and date inputs. */
export const toIsoDate = (date?: string | Date | null) => {
    if (!date) return '';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) return '';
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    return `${parsed.getFullYear()}-${month}-${day}`;
};

export const describeAttributes = (attributes?: { label?: string; value?: string }[]) =>
    (attributes ?? []).map((attr) => attr.label || attr.value).filter(Boolean).join(' / ');

/* --------------------------------- labels -------------------------------- */

export const PRODUCT_KIND_OPTIONS: { value: ProductKind; label: string; hint: string }[] = [
    { value: 'physical', label: 'کالا', hint: 'قلم فیزیکی که فروخته و ارسال می‌شود' },
    { value: 'service', label: 'خدمات', hint: 'مثل تعمیر یا ساخت اپل‌آیدی؛ موجودی و ارسال ندارد' }
];

export const SALES_CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
    { value: 'website', label: 'نمایش در وب‌سایت' },
    { value: 'in_person', label: 'فروش حضوری' }
];

export const STOCK_MODE_OPTIONS: { value: StockMode; label: string; hint: string }[] = [
    { value: 'tracked', label: 'در مغازه دارم', hint: 'موجودی شمرده می‌شود و با هر فروش کم می‌شود' },
    {
        value: 'on_demand',
        label: 'ندارم، لحظه‌ای تأمین می‌کنم',
        hint: 'موجودی ندارد ولی همیشه قابل سفارش است و از تأمین‌کننده تهیه می‌شود'
    },
    { value: 'none', label: 'بدون موجودی (خدمات)', hint: 'نه موجودی دارد نه ارسال' }
];

export const STOCK_MODE_CONFIG: Record<StockMode, { label: string; color: BadgeColor }> = {
    tracked: { label: 'انبارشده', color: 'success' },
    on_demand: { label: 'تأمین لحظه‌ای', color: 'info' },
    none: { label: 'بدون موجودی', color: 'light' }
};

export const PURCHASE_STATUS_CONFIG: Record<PurchaseStatus, { label: string; color: BadgeColor }> = {
    draft: { label: 'پیش‌نویس', color: 'warning' },
    confirmed: { label: 'تأیید شده', color: 'success' },
    canceled: { label: 'لغو شده', color: 'error' }
};

export const PAYMENT_STATE_CONFIG: Record<PaymentState, { label: string; color: BadgeColor }> = {
    unpaid: { label: 'پرداخت نشده', color: 'error' },
    partial: { label: 'پرداخت جزئی', color: 'warning' },
    paid: { label: 'تسویه شده', color: 'success' }
};

export const MOVEMENT_TYPE_CONFIG: Record<MovementType, { label: string; color: BadgeColor }> = {
    purchase_in: { label: 'ورود از خرید', color: 'success' },
    sale_out: { label: 'فروش از انبار', color: 'primary' },
    return_in: { label: 'برگشت به انبار', color: 'info' },
    adjustment: { label: 'اصلاح دستی', color: 'warning' },
    external_supply: { label: 'تأمین بیرونی', color: 'info' },
    service_sale: { label: 'فروش خدمات', color: 'light' }
};

export const PURCHASE_STATUS_OPTIONS = (Object.keys(PURCHASE_STATUS_CONFIG) as PurchaseStatus[]).map((value) => ({
    value,
    label: PURCHASE_STATUS_CONFIG[value].label
}));

export const PAYMENT_STATE_OPTIONS = (Object.keys(PAYMENT_STATE_CONFIG) as PaymentState[]).map((value) => ({
    value,
    label: PAYMENT_STATE_CONFIG[value].label
}));

export const MOVEMENT_TYPE_OPTIONS = (Object.keys(MOVEMENT_TYPE_CONFIG) as MovementType[]).map((value) => ({
    value,
    label: MOVEMENT_TYPE_CONFIG[value].label
}));

export const REF_TYPE_OPTIONS = [
    { value: 'order', label: 'سفارش' },
    { value: 'purchase', label: 'فاکتور خرید' },
    { value: 'manual', label: 'دستی' },
    { value: 'stocktake', label: 'انبارگردانی' }
];

export const PROFIT_GROUP_TABS: { value: 'day' | 'product' | 'supplier'; label: string }[] = [
    { value: 'day', label: 'روزانه' },
    { value: 'product', label: 'بر اساس محصول' },
    { value: 'supplier', label: 'بر اساس تأمین‌کننده' }
];
