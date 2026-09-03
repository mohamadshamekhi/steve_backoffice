import { BadgeColor } from 'libs/ui/badge/badge.types';

export const PARTNER_SHOP_ACCESS = 'partner_shop:access';
export const PARTNER_SHOP_ORDER = 'partner_shop:order';

export const formatToman = (value: number) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`;

export const formatShopDate = (date?: string | null) =>
    date
        ? new Date(date).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
        : '-';

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: BadgeColor }> = {
    pending_payment: { label: 'در انتظار پرداخت حضوری', color: 'warning' },
    processing: { label: 'پرداخت شد - آمادهٔ تحویل', color: 'info' },
    delivered: { label: 'تحویل شد', color: 'success' },
    cancelled: { label: 'لغو شده', color: 'error' }
};

export const getOrderStatusConfig = (status: string) =>
    ORDER_STATUS_CONFIG[status] ?? { label: status, color: 'light' as BadgeColor };

export const PARTNER_TXN_STORAGE_KEY = 'partner_txn';
