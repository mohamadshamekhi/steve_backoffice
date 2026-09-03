import { BadgeColor } from 'libs/ui/badge/badge.types';
import { PartnerStatus } from 'libs/models/partner.model';

export const PARTNER_STATUS_CONFIG: Record<PartnerStatus, { label: string; color: BadgeColor }> = {
    pending: { label: 'در انتظار بررسی', color: 'warning' },
    approved: { label: 'تأیید شده', color: 'success' },
    rejected: { label: 'رد شده', color: 'error' },
    suspended: { label: 'معلق', color: 'dark' }
};

export const PARTNER_STATUS_TABS: { value: '' | PartnerStatus; label: string }[] = [
    { value: 'pending', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأیید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'suspended', label: 'معلق' },
    { value: '', label: 'همه' }
];

export const getPartnerStatusConfig = (status: string) =>
    PARTNER_STATUS_CONFIG[status as PartnerStatus] ?? { label: status, color: 'light' as BadgeColor };

export const formatPartnerDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('fa-IR') : '-');
