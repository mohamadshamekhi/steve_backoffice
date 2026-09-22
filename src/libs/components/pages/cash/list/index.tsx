'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import DeleteModal from 'libs/components/common/DeleteModal/DeleteModal';
import Pagination from 'libs/components/common/Pagination';
import {
    CASH_CREATE,
    CASH_DELETE,
    CASH_DIRECTION_CONFIG,
    CASH_DIRECTION_OPTIONS,
    CASH_REF_TYPE_OPTIONS,
    cashRefLabel,
    PAYMENT_METHOD_OPTIONS,
    paymentMethodLabel
} from 'libs/constants/accounting/accounting.constants';
import {
    DEFAULT_PAGE_SIZE,
    formatDateTime,
    formatToman,
    signedClass,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { ICashListResponse, ICashTransaction } from 'libs/models/accounting.model';
import { Badge, Button, CSelect, DatePicker, Table } from 'libs/ui';
import { downloadCsv } from 'libs/utilities';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import CashForm from '../form';

const DIRECTION_FILTER_OPTIONS = [{ value: '', label: 'همه' }, ...CASH_DIRECTION_OPTIONS];
const METHOD_FILTER_OPTIONS = [{ value: '', label: 'همه روش‌ها' }, ...PAYMENT_METHOD_OPTIONS];
const REF_FILTER_OPTIONS = [{ value: '', label: 'همه منابع' }, ...CASH_REF_TYPE_OPTIONS];

const StatCard = ({ label, value, valueClass = '' }: { label: string; value: React.ReactNode; valueClass?: string }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-white ${valueClass}`}>{value}</p>
    </div>
);

const CashList = () => {
    const canCreate = usePermission(CASH_CREATE);
    const canDelete = usePermission(CASH_DELETE);

    const [page, setPage] = useState(1);
    const [direction, setDirection] = useState('');
    const [method, setMethod] = useState('');
    const [refType, setRefType] = useState('');
    const [from, setFrom] = useState<DateObject | null>(null);
    const [to, setTo] = useState<DateObject | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<ICashTransaction | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    const params = {
        ...(direction && { direction }),
        ...(method && { method }),
        ...(refType && { ref_type: refType }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate })
    };

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_ALL_CASH, page, direction, method, refType, fromDate, toDate],
        ([url, pageNum]: [string, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: DEFAULT_PAGE_SIZE, ...params }
            })
    );

    const result: ICashListResponse | undefined = data?.data;

    const resetPage = () => setPage(1);

    const handleExport = async () => {
        setExporting(true);
        try {
            await downloadCsv(ApiKeys.GET_ALL_CASH, params, 'cash');
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            const response = await fetcher(ApiKeys.DELETE_CASH(deleting.id), 'dashboard', 'DELETE');
            if (response?.success) {
                toast.success('تراکنش حذف شد');
                mutate();
                setDeleting(null);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: ColumnDef<ICashTransaction>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'occurred_at',
            header: 'تاریخ',
            cell: ({ row }) => formatDateTime(row.original.occurred_at)
        },
        {
            accessorKey: 'direction',
            header: 'نوع',
            cell: ({ row }) => {
                const config = CASH_DIRECTION_CONFIG[row.original.direction];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.direction}</Badge>;
            }
        },
        {
            accessorKey: 'amount',
            header: 'مبلغ',
            cell: ({ row }) => (
                <span className={signedClass(row.original.direction === 'out' ? -1 : 1)}>
                    {formatToman(row.original.amount)}
                </span>
            )
        },
        {
            accessorKey: 'method',
            header: 'روش',
            cell: ({ row }) => paymentMethodLabel(row.original.method)
        },
        {
            accessorKey: 'ref_type',
            header: 'منبع',
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <span>{cashRefLabel(row.original.ref_type)}</span>
                    {row.original.is_auto && (
                        <Badge color='light'>خودکار</Badge>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'description',
            header: 'توضیح',
            cell: ({ row }) => row.original.description || '-'
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    size='sm'
                    variant='outline'
                    className='text-error-500 text-nowrap'
                    // تراکنش خودکار سند سیستم است و فقط با حذف مرجعش برمی‌گردد.
                    disabled={!canDelete || Boolean(row.original.is_auto)}
                    onClick={() => setDeleting(row.original)}
                >
                    حذف
                </Button>
            )
        }
    ];

    return (
        <ContentWrapper
            title='صندوق'
            extra={
                <div className='flex flex-wrap items-center gap-2'>
                    <Button size='sm' variant='outline' loading={exporting} onClick={handleExport}>
                        خروجی اکسل
                    </Button>
                    {canCreate && (
                        <Button size='sm' onClick={() => setFormOpen(true)}>
                            ثبت تراکنش
                        </Button>
                    )}
                </div>
            }
        >
            <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <StatCard label='دریافتی' value={formatToman(result?.summary?.total_in ?? 0)} />
                <StatCard label='پرداختی' value={formatToman(result?.summary?.total_out ?? 0)} />
                <StatCard
                    label='مانده صندوق'
                    value={formatToman(result?.summary?.balance ?? 0)}
                    valueClass={signedClass(result?.summary?.balance)}
                />
            </div>

            <div className='mb-4 flex flex-wrap items-end gap-3'>
                <div className='w-full md:w-36'>
                    <label className='mb-1 block text-xs text-gray-400'>نوع</label>
                    <CSelect
                        name='direction'
                        options={DIRECTION_FILTER_OPTIONS}
                        value={direction}
                        onChange={(value) => {
                            setDirection(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-48'>
                    <label className='mb-1 block text-xs text-gray-400'>روش پرداخت</label>
                    <CSelect
                        name='method'
                        options={METHOD_FILTER_OPTIONS}
                        value={method}
                        onChange={(value) => {
                            setMethod(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-44'>
                    <label className='mb-1 block text-xs text-gray-400'>منبع</label>
                    <CSelect
                        name='ref_type'
                        options={REF_FILTER_OPTIONS}
                        value={refType}
                        onChange={(value) => {
                            setRefType(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-40'>
                    <label className='mb-1 block text-xs text-gray-400'>از تاریخ</label>
                    <DatePicker
                        name='from'
                        value={from ?? undefined}
                        onChange={(value) => {
                            setFrom(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-40'>
                    <label className='mb-1 block text-xs text-gray-400'>تا تاریخ</label>
                    <DatePicker
                        name='to'
                        value={to ?? undefined}
                        onChange={(value) => {
                            setTo(value);
                            resetPage();
                        }}
                    />
                </div>
            </div>

            <Table<ICashTransaction>
                headerClass='text-nowrap'
                columns={columns}
                data={result?.transactions ?? []}
                loading={isLoading}
            />

            <Pagination
                currentPage={page}
                total={result?.pagination?.total ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
            />

            {formOpen && <CashForm isOpen={formOpen} onClose={() => setFormOpen(false)} mutate={mutate} />}

            <DeleteModal
                isOpen={Boolean(deleting)}
                loading={deleteLoading}
                title='حذف تراکنش صندوق'
                description='این تراکنش از دفتر صندوق حذف می‌شود و مانده دوباره محاسبه می‌شود.'
                onClose={() => setDeleting(null)}
                onDelete={handleDelete}
            />
        </ContentWrapper>
    );
};

export default CashList;
