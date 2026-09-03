import { BadgeColor } from 'libs/ui/badge/badge.types';
import { ReferralDiscountType } from 'libs/models/referral.model';

export const REFERRAL_LIST = 'referral:list';
export const REFERRAL_VIEW = 'referral:view';
export const REFERRAL_MANAGE = 'referral:manage';

/** Roles that have referral access by default (per backend spec). */
export const REFERRAL_ROLES = ['super_admin', 'marketing_manager'];

export const formatToman = (value: number) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`;

export const formatReferralDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('fa-IR') : '-';

export const formatPercent = (ratio: number) => `${(Number(ratio || 0) * 100).toLocaleString('fa-IR', {
    maximumFractionDigits: 1
})}%`;

export const DISCOUNT_TYPE_OPTIONS: { value: ReferralDiscountType; label: string }[] = [
    { value: 'percentage', label: 'درصدی' },
    { value: 'fixed_amount', label: 'مبلغ ثابت (تومان)' }
];

export const discountTypeLabel = (type: string) =>
    DISCOUNT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;

export const describeDiscount = (type: string, value: number) =>
    type === 'percentage' ? `${Number(value).toLocaleString('fa-IR')}٪` : formatToman(value);

export const INVITEE_SOURCE_CONFIG: Record<string, { label: string; color: BadgeColor }> = {
    link: { label: 'لینک', color: 'info' },
    sms: { label: 'پیامک', color: 'primary' }
};

export const INVITEE_STATUS_CONFIG: Record<string, { label: string; color: BadgeColor }> = {
    invited: { label: 'دعوت‌شده', color: 'warning' },
    joined: { label: 'عضو شده', color: 'success' }
};
