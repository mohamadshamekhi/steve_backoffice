export const BIRTHDAY_VIEW = 'birthday:view';
export const BIRTHDAY_MANAGE = 'birthday:manage';

/** Roles that have birthday-discount access by default (per backend seeder). */
export const BIRTHDAY_ROLES = ['super_admin', 'marketing_manager'];

const faNumber = (n: number) => Number(n || 0).toLocaleString('fa-IR', { useGrouping: false });

export const formatHour = (hour: number) => `${faNumber(hour).padStart(2, '۰')}:۰۰`;

export const SEND_HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: formatHour(h) }));

export const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('fa-IR') : '-');

/** متن خلاصه: «امروز تولدشان است» / «حداکثر ۳ روز تا تولدشان مانده» */
export const describeDaysBefore = (days: number) =>
    Number(days) === 0 ? 'امروز تولدشان است' : `حداکثر ${Number(days).toLocaleString('fa-IR')} روز تا تولدشان مانده`;
