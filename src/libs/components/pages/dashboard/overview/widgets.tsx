'use client';

import { formatNumber } from 'libs/constants/warehouse/warehouse.constants';
import Link from 'next/link';

/* --------------------------------- period -------------------------------- */

export type Period = 'today' | '7d' | '30d' | 'month';

export const PERIOD_OPTIONS: { value: Period; label: string; compare: string }[] = [
    { value: 'today', label: 'امروز', compare: 'نسبت به دیروز' },
    { value: '7d', label: '۷ روز', compare: 'نسبت به ۷ روز قبل' },
    { value: '30d', label: '۳۰ روز', compare: 'نسبت به ۳۰ روز قبل' },
    { value: 'month', label: 'این ماه', compare: 'نسبت به ماه قبل' }
];

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** بازه‌ی جاری و بازه‌ی هم‌طول قبلی برای مقایسه. */
export const periodRange = (period: Period) => {
    const today = startOfDay(new Date());
    let from: Date;

    if (period === 'today') from = today;
    else if (period === '7d') from = new Date(today.getTime() - 6 * DAY);
    else if (period === '30d') from = new Date(today.getTime() - 29 * DAY);
    else from = new Date(today.getFullYear(), today.getMonth(), 1);

    const days = Math.round((today.getTime() - from.getTime()) / DAY) + 1;
    const prevTo = new Date(from.getTime() - DAY);
    const prevFrom = period === 'month' ? new Date(from.getFullYear(), from.getMonth() - 1, 1) : new Date(prevTo.getTime() - (days - 1) * DAY);

    return { from, to: today, prevFrom, prevTo };
};

export const changePercent = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
};

/** مبلغ کوتاه‌شده برای کارت‌ها و محور نمودار (مثلاً ۱٫۲ میلیون). */
export const compactToman = (value?: number | null) => {
    const num = Number(value ?? 0);
    const abs = Math.abs(num);
    const fmt = (n: number) => n.toLocaleString('fa-IR', { maximumFractionDigits: 1 });
    if (abs >= 1e9) return `${fmt(num / 1e9)} میلیارد`;
    if (abs >= 1e6) return `${fmt(num / 1e6)} میلیون`;
    if (abs >= 1e3) return `${fmt(num / 1e3)} هزار`;
    return formatNumber(num);
};

/* ---------------------------------- icons --------------------------------- */

const icon = (path: React.ReactNode) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-5 w-5'
        aria-hidden='true'
    >
        {path}
    </svg>
);

export const Icons = {
    revenue: icon(
        <>
            <path d='M3 17l6-6 4 4 8-8' />
            <path d='M14 7h7v7' />
        </>
    ),
    profit: icon(
        <>
            <circle cx='12' cy='12' r='9' />
            <path d='M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3-1.6M12 6v2m0 8v2' />
        </>
    ),
    cash: icon(
        <>
            <rect x='3' y='6' width='18' height='13' rx='2' />
            <path d='M3 10h18M16 15h2' />
        </>
    ),
    debt: icon(
        <>
            <path d='M4 20V8l8-4 8 4v12' />
            <path d='M9 20v-6h6v6M4 20h16' />
        </>
    ),
    box: icon(
        <>
            <path d='M21 8l-9-5-9 5 9 5 9-5z' />
            <path d='M3 8v8l9 5 9-5V8M12 13v8' />
        </>
    ),
    alert: icon(
        <>
            <path d='M12 3l10 18H2L12 3z' />
            <path d='M12 10v4M12 17.5v.01' />
        </>
    ),
    arrow: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='h-4 w-4' aria-hidden='true'>
            <path d='M15 18l-6-6 6-6' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    )
};

/* ---------------------------------- parts --------------------------------- */

export const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`} />
);

export const DeltaBadge = ({ value, label }: { value: number | null; label?: string }) => {
    if (value === null || !Number.isFinite(value)) return null;

    const color =
        value >= 0
            ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400'
            : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400';

    return (
        <>
            <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${color}`} dir='ltr'>
                {value >= 0 ? '▲' : '▼'} {Math.abs(value).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
            </span>
            {label && <span>{label}</span>}
        </>
    );
};

type Tone = 'brand' | 'success' | 'warning' | 'error' | 'gray';

const TONES: Record<Tone, string> = {
    brand: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
};

export const KpiCard = ({
    label,
    value,
    title,
    icon: kpiIcon,
    tone,
    footer,
    loading,
    href
}: {
    label: string;
    value: React.ReactNode;
    title?: string;
    icon: React.ReactNode;
    tone: Tone;
    footer?: React.ReactNode;
    loading?: boolean;
    href?: string;
}) => {
    const body = (
        <div className='flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>{label}</p>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>{kpiIcon}</span>
            </div>
            {loading ? (
                <Skeleton className='mt-3 h-8 w-32' />
            ) : (
                <p className='mt-2 text-2xl font-bold text-gray-900 tabular-nums dark:text-white' title={title}>
                    {value}
                </p>
            )}
            {footer && <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400'>{footer}</div>}
        </div>
    );

    return href ? (
        <Link href={href} className='focus-visible:ring-brand-500 block rounded-2xl focus-visible:ring-2 focus-visible:outline-none'>
            {body}
        </Link>
    ) : (
        body
    );
};

/** کارت کوچک برای شاخص‌های ثانویه. */
export const MiniStat = ({
    label,
    value,
    hint,
    href,
    loading,
    urgent
}: {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    href?: string;
    loading?: boolean;
    /** وقتی true، کارت با حاشیه‌ی کهربایی و نقطه‌ی چشمک‌زن برای جلب توجه سریع نمایش داده می‌شود. */
    urgent?: boolean;
}) => {
    const body = (
        <div
            className={`flex h-full items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4 transition-colors dark:bg-white/[0.03] ${
                urgent
                    ? 'border-amber-300 hover:border-amber-400 dark:border-amber-500/40 dark:hover:border-amber-500/60'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
            }`}
        >
            <div className='min-w-0'>
                <p className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
                    {label}
                    {urgent && (
                        <span className='relative flex h-2 w-2 shrink-0' aria-hidden='true'>
                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75' />
                            <span className='relative inline-flex h-2 w-2 rounded-full bg-amber-500' />
                        </span>
                    )}
                </p>
                {loading ? (
                    <Skeleton className='mt-2 h-6 w-20' />
                ) : (
                    <p
                        className={`mt-1 text-lg font-bold tabular-nums ${urgent ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}
                    >
                        {value}
                    </p>
                )}
            </div>
            {hint && <div className='flex shrink-0 flex-col items-end gap-1 text-xs text-gray-400'>{hint}</div>}
        </div>
    );

    return href ? (
        <Link href={href} className='focus-visible:ring-brand-500 block rounded-2xl focus-visible:ring-2 focus-visible:outline-none'>
            {body}
        </Link>
    ) : (
        body
    );
};

export const Panel = ({
    title,
    subtitle,
    href,
    extra,
    className = '',
    children
}: React.PropsWithChildren<{ title: string; subtitle?: string; href?: string; extra?: React.ReactNode; className?: string }>) => (
    <section
        className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
        <header className='mb-4 flex items-start justify-between gap-3'>
            <div>
                <h2 className='text-base font-semibold text-gray-800 dark:text-white/90'>{title}</h2>
                {subtitle && <p className='mt-0.5 text-xs text-gray-400'>{subtitle}</p>}
            </div>
            {extra}
            {href && (
                <Link
                    href={href}
                    className='text-brand-500 hover:text-brand-600 inline-flex shrink-0 items-center gap-1 text-xs font-medium'
                >
                    مشاهده گزارش {Icons.arrow}
                </Link>
            )}
        </header>
        <div className='flex-1'>{children}</div>
    </section>
);

export const Empty = ({ text = 'داده‌ای برای این بازه ثبت نشده است.' }: { text?: string }) => (
    <div className='flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-xl bg-gray-50/70 p-6 text-center dark:bg-white/[0.02]'>
        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-300 shadow-xs dark:bg-gray-800 dark:text-gray-600'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} className='h-5 w-5' aria-hidden='true'>
                <path d='M4 19h16M7 15v-3M12 15V8M17 15v-5' strokeLinecap='round' />
            </svg>
        </span>
        <p className='text-sm text-gray-400'>{text}</p>
    </div>
);

/** مبلغ کوتاه‌شده با واحد کم‌رنگ؛ `signed` رنگ مثبت/منفی می‌دهد. */
export const Money = ({ value, signed = false }: { value?: number | null; signed?: boolean }) => {
    const num = Number(value ?? 0);
    const color = !signed || num === 0 ? '' : num > 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400';
    return (
        <span className={color}>
            {compactToman(num)}
            <span className='ms-1.5 text-sm font-normal text-gray-400'>تومان</span>
        </span>
    );
};

/** نوار افقی ساده برای رتبه‌بندی‌ها (پرفروش‌ها، هزینه‌ها). */
export const BarRow = ({
    label,
    value,
    ratio,
    color = 'bg-brand-500',
    hint
}: {
    label: string;
    value: string;
    ratio: number;
    color?: string;
    hint?: string;
}) => (
    <li className='space-y-1.5'>
        <div className='flex items-center justify-between gap-3 text-sm'>
            <span className='truncate text-gray-700 dark:text-gray-300' title={label}>
                {label}
            </span>
            <span className='shrink-0 font-medium text-gray-900 tabular-nums dark:text-white'>{value}</span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(ratio * 100, 2)}%` }} />
        </div>
        {hint && <p className='text-xs text-gray-400'>{hint}</p>}
    </li>
);
