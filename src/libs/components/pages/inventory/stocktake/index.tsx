'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import {
    describeAttributes,
    formatNumber,
    formatToman,
    INVENTORY_ADJUST,
    signedClass
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IStockRow } from 'libs/models/warehouse.model';
import { Badge, Button, Input, Link, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

const DRAFT_KEY = 'stocktake-draft';
const PAGE_SIZE = 50;
const MAX_ITEMS = 2000;

type View = 'all' | 'counted' | 'diff';

const VIEWS: { value: View; label: string }[] = [
    { value: 'all', label: 'همه‌ی کالاها' },
    { value: 'counted', label: 'شمارش‌شده' },
    { value: 'diff', label: 'دارای مغایرت' }
];

/** Snapshot of the stock row at count time, so counts on other pages still show in the summary. */
type Draft = Record<string, { row: IStockRow; counted: string }>;

interface IStocktakeResult {
    stocktake_id: string;
    adjusted_count: number;
    unchanged_count: number;
    surplus_units: number;
    shortage_units: number;
    value_diff: number;
}

const readDraft = (): Draft => {
    try {
        const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}');
        // Older drafts stored plain strings without a row snapshot; they can't be submitted.
        return Object.fromEntries(
            Object.entries(parsed).filter(([, value]) => (value as Draft[string])?.row)
        ) as Draft;
    } catch {
        return {};
    }
};

const StatCard = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-white ${className ?? ''}`}>{value}</p>
    </div>
);

const InventoryStocktake = () => {
    const canAdjust = usePermission(INVENTORY_ADJUST);

    const [draft, setDraft] = useState<Draft>({});
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [view, setView] = useState<View>('all');
    const [page, setPage] = useState(1);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorVariant, setErrorVariant] = useState<string | null>(null);
    const [result, setResult] = useState<IStocktakeResult | null>(null);

    useEffect(() => setDraft(readDraft()), []);

    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {
            /* storage unavailable */
        }
    }, [draft]);

    useEffect(() => {
        const next = searchInput.trim();
        if (next === search) return;
        const timer = setTimeout(() => {
            setSearch(next);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, search]);

    const { data, isLoading, mutate } = useSWR(
        view === 'all' ? [ApiKeys.GET_INVENTORY_STOCK, 'stocktake', page, search] : null,
        ([url, , pageNum, term]: [string, string, number, string]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: {
                    page_number: pageNum,
                    page_size: PAGE_SIZE,
                    stock_mode: 'tracked',
                    ...(term && { search: term })
                }
            })
    );

    const serverRows: IStockRow[] = useMemo(() => data?.data?.rows ?? [], [data]);

    // Keep the snapshot's system quantity fresh for counted rows we just re-fetched.
    useEffect(() => {
        if (!serverRows.length) return;
        setDraft((prev) => {
            let changed = false;
            const next = { ...prev };
            serverRows.forEach((row) => {
                const entry = next[row.variant_id];
                if (entry && (entry.row.quantity !== row.quantity || entry.row.avg_cost !== row.avg_cost)) {
                    next[row.variant_id] = { ...entry, row };
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [serverRows]);

    const entries = useMemo(() => Object.values(draft), [draft]);

    const summary = useMemo(() => {
        let surplus = 0;
        let shortage = 0;
        let valueDiff = 0;
        let diffCount = 0;
        entries.forEach(({ row, counted }) => {
            const diff = Number(counted) - row.quantity;
            if (!diff) return;
            diffCount++;
            if (diff > 0) surplus += diff;
            else shortage -= diff;
            valueDiff += diff * (row.avg_cost ?? 0);
        });
        return { counted: entries.length, diffCount, surplus, shortage, valueDiff };
    }, [entries]);

    const localRows = useMemo(() => {
        if (view === 'all') return [];
        const term = search.toLowerCase();
        return entries
            .filter(({ row, counted }) => view === 'counted' || Number(counted) !== row.quantity)
            .filter(({ row }) =>
                term
                    ? `${row.product_name} ${describeAttributes(row.attributes)} ${row.variant_id}`
                          .toLowerCase()
                          .includes(term)
                    : true
            )
            .map(({ row }) => row);
    }, [view, entries, search]);

    const tableRows = view === 'all' ? serverRows : localRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const total = view === 'all' ? (data?.data?.pagination?.total ?? 0) : localRows.length;

    const setCount = (row: IStockRow, value: string) => {
        if (errorVariant === row.variant_id) setErrorVariant(null);
        setDraft((prev) => {
            const next = { ...prev };
            if (value === '' || Number(value) < 0) delete next[row.variant_id];
            else next[row.variant_id] = { row: prev[row.variant_id]?.row ?? row, counted: value };
            return next;
        });
    };

    const diffOf = (row: IStockRow) => {
        const entry = draft[row.variant_id];
        return entry ? Number(entry.counted) - row.quantity : null;
    };

    const columns: ColumnDef<IStockRow>[] = [
        {
            accessorKey: 'product_name',
            header: 'محصول',
            cell: ({ row }) => (
                <span className={errorVariant === row.original.variant_id ? 'text-error-600 font-medium' : ''}>
                    {row.original.product_name}
                </span>
            )
        },
        {
            id: 'attributes',
            header: 'واریانت',
            cell: ({ row }) => describeAttributes(row.original.attributes) || '-'
        },
        {
            accessorKey: 'quantity',
            header: 'موجودی سیستم',
            cell: ({ row }) => formatNumber(row.original.quantity)
        },
        {
            id: 'counted',
            header: 'شمارش واقعی',
            enableSorting: false,
            cell: ({ row }) => (
                <div className='w-28'>
                    <Input
                        name={`count-${row.original.variant_id}`}
                        type='number'
                        min='0'
                        inputMode='numeric'
                        aria-label={`شمارش ${row.original.product_name}`}
                        value={draft[row.original.variant_id]?.counted ?? ''}
                        error={errorVariant === row.original.variant_id}
                        disabled={submitting}
                        onChange={(e) => setCount(row.original, e.target.value)}
                    />
                </div>
            )
        },
        {
            id: 'diff',
            header: 'مغایرت',
            cell: ({ row }) => {
                const diff = diffOf(row.original);
                if (diff === null) return <span className='text-gray-400'>-</span>;
                if (diff === 0) return <Badge color='success'>مطابق</Badge>;
                return (
                    <span className={`font-medium ${signedClass(diff)}`} dir='ltr'>
                        {diff > 0 ? '+' : ''}
                        {formatNumber(diff)}
                    </span>
                );
            }
        },
        {
            id: 'diff_value',
            header: 'ارزش مغایرت',
            cell: ({ row }) => {
                const diff = diffOf(row.original);
                if (!diff) return <span className='text-gray-400'>-</span>;
                const value = diff * (row.original.avg_cost ?? 0);
                return <span className={signedClass(value)}>{formatToman(value)}</span>;
            }
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    size='sm'
                    variant='outline'
                    className='text-nowrap'
                    disabled={submitting}
                    onClick={() => setCount(row.original, String(row.original.quantity))}
                >
                    مطابق است
                </Button>
            )
        }
    ];

    const resetDraft = () => {
        if (!entries.length) return;
        if (!window.confirm('همه‌ی شمارش‌های واردشده پاک شود؟')) return;
        setDraft({});
        setErrorVariant(null);
    };

    const openConfirm = () => {
        if (entries.length > MAX_ITEMS) {
            toast.error(`حداکثر ${formatNumber(MAX_ITEMS)} قلم در هر انبارگردانی قابل ثبت است`);
            return;
        }
        setConfirmOpen(true);
    };

    const submit = async () => {
        // Send every counted item, including unchanged ones; the server computes the diff.
        const items = entries.map(({ row, counted }) => ({
            product_id: row.product_id,
            variant_id: row.variant_id,
            counted_quantity: Number(counted)
        }));

        setSubmitting(true);
        try {
            const response = await fetcher(ApiKeys.POST_INVENTORY_STOCKTAKE, 'dashboard', 'POST', {
                body: { items, ...(note.trim() && { note: note.trim() }) }
            });

            if (response?.success) {
                setResult(response.data);
                setConfirmOpen(false);
                setDraft({});
                setNote('');
                setErrorVariant(null);
                setView('all');
                mutate();
                return;
            }

            // All-or-nothing: the server points at the failing item; its message is already toasted.
            const index = response?.meta?.index;
            if (typeof index === 'number' && items[index]) {
                setErrorVariant(items[index].variant_id);
                setConfirmOpen(false);
                setView('counted');
                setSearch('');
                setSearchInput('');
                const position = entries.findIndex(({ row }) => row.variant_id === items[index].variant_id);
                setPage(Math.floor(Math.max(position, 0) / PAGE_SIZE) + 1);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
                <StatCard label='اقلام شمارش‌شده' value={formatNumber(summary.counted)} />
                <StatCard label='اقلام دارای مغایرت' value={formatNumber(summary.diffCount)} />
                <StatCard
                    label='مازاد (واحد)'
                    value={formatNumber(summary.surplus)}
                    className={signedClass(summary.surplus)}
                />
                <StatCard
                    label='کسری (واحد)'
                    value={formatNumber(summary.shortage)}
                    className={signedClass(-summary.shortage)}
                />
                <StatCard
                    label='ارزش خالص مغایرت (تخمینی)'
                    value={formatToman(summary.valueDiff)}
                    className={signedClass(summary.valueDiff)}
                />
            </div>

            <ContentWrapper
                title='انبارگردانی'
                extra={
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button size='sm' variant='outline' onClick={resetDraft} disabled={submitting}>
                            پاک کردن شمارش‌ها
                        </Button>
                        {canAdjust && (
                            <Button size='sm' disabled={!entries.length || submitting} onClick={openConfirm}>
                                ثبت انبارگردانی ({formatNumber(entries.length)} قلم)
                            </Button>
                        )}
                    </div>
                }
            >
                <p className='mb-4 text-xs text-gray-400'>
                    تعداد واقعی هر کالا را وارد کنید. فقط کالاهای «موجودی‌دار» نمایش داده می‌شوند. شمارش‌ها در این
                    مرورگر ذخیره می‌شوند و با رفرش صفحه از بین نمی‌روند. هنگام ثبت، مغایرت هر قلم با موجودی لحظه‌ی ثبت
                    محاسبه و یکجا در دفتر حرکت کالا ثبت می‌شود.
                </p>

                <div className='mb-4 flex flex-wrap items-end gap-4'>
                    <div className='w-full sm:w-72'>
                        <label className='mb-1 block text-xs text-gray-400'>جستجو</label>
                        <Input
                            name='search'
                            placeholder='نام محصول یا شناسه'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <div className='flex flex-wrap gap-2' role='group' aria-label='نمایش'>
                        {VIEWS.map((option) => (
                            <Button
                                key={option.value}
                                size='sm'
                                variant={view === option.value ? 'primary' : 'outline'}
                                aria-pressed={view === option.value}
                                onClick={() => {
                                    setView(option.value);
                                    setPage(1);
                                }}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <Table<IStockRow>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={tableRows}
                    loading={view === 'all' && isLoading}
                />

                <Pagination currentPage={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </ContentWrapper>

            <Modal
                isOpen={confirmOpen}
                onClose={() => !submitting && setConfirmOpen(false)}
                className='max-w-[520px] p-6'
            >
                <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>ثبت نتیجه‌ی انبارگردانی</h3>
                <div className='mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                    <p>
                        {formatNumber(summary.counted)} قلم ارسال می‌شود؛ طبق شمارش فعلی{' '}
                        {formatNumber(summary.diffCount)} قلم مغایرت دارد (مازاد {formatNumber(summary.surplus)}،
                        کسری {formatNumber(summary.shortage)} واحد).
                    </p>
                    <p className='text-xs text-gray-400'>
                        مغایرت نهایی با موجودی لحظه‌ی ثبت محاسبه می‌شود. اگر یک قلم مشکل داشته باشد هیچ‌چیز ثبت
                        نمی‌شود.
                    </p>
                </div>

                <div className='mt-4'>
                    <label className='mb-1 block text-xs text-gray-400'>توضیح (اختیاری)</label>
                    <Input
                        name='note'
                        placeholder='مثلاً: انبارگردانی پایان مهر'
                        value={note}
                        disabled={submitting}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className='mt-5 flex justify-end gap-2'>
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={submitting}
                        onClick={() => setConfirmOpen(false)}
                    >
                        انصراف
                    </Button>
                    <Button type='button' size='sm' loading={submitting} disabled={submitting} onClick={submit}>
                        تأیید و ثبت
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={Boolean(result)} onClose={() => setResult(null)} className='max-w-[520px] p-6'>
                {result && (
                    <>
                        <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>انبارگردانی ثبت شد</h3>
                        <dl className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                            <dt className='text-gray-400'>اقلام اصلاح‌شده</dt>
                            <dd>{formatNumber(result.adjusted_count)}</dd>
                            <dt className='text-gray-400'>اقلام بدون تغییر</dt>
                            <dd>{formatNumber(result.unchanged_count)}</dd>
                            <dt className='text-gray-400'>مازاد (واحد)</dt>
                            <dd>{formatNumber(result.surplus_units)}</dd>
                            <dt className='text-gray-400'>کسری (واحد)</dt>
                            <dd>{formatNumber(result.shortage_units)}</dd>
                            <dt className='text-gray-400'>ارزش خالص مغایرت</dt>
                            <dd className={signedClass(result.value_diff)}>{formatToman(result.value_diff)}</dd>
                        </dl>
                        <div className='mt-5 flex justify-end gap-2'>
                            <Link
                                href={ROUTES.StocktakeMovements(result.stocktake_id)}
                                className='text-brand-500 text-sm'
                            >
                                مشاهده‌ی جزئیات در دفتر حرکت کالا
                            </Link>
                            <Button type='button' size='sm' onClick={() => setResult(null)}>
                                بستن
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default InventoryStocktake;
