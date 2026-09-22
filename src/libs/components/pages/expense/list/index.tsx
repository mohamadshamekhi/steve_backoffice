'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import DeleteModal from 'libs/components/common/DeleteModal/DeleteModal';
import Pagination from 'libs/components/common/Pagination';
import SupplierSelect from 'libs/components/pages/supplier/select';
import {
    EXPENSE_CATEGORY_CONFIG,
    EXPENSE_CATEGORY_OPTIONS,
    EXPENSE_CREATE,
    EXPENSE_DELETE,
    EXPENSE_UPDATE,
    IS_PAID_OPTIONS,
    paymentMethodLabel
} from 'libs/constants/accounting/accounting.constants';
import {
    DEFAULT_PAGE_SIZE,
    formatDate,
    formatToman,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IExpense, IExpenseListResponse } from 'libs/models/accounting.model';
import { Badge, Button, CSelect, DatePicker, Input, Table } from 'libs/ui';
import { downloadCsv } from 'libs/utilities';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import ExpenseForm from '../form';

const CATEGORY_FILTER_OPTIONS = [{ value: '', label: 'همه دسته‌ها' }, ...EXPENSE_CATEGORY_OPTIONS];

const ExpenseList = () => {
    const canCreate = usePermission(EXPENSE_CREATE);
    const canUpdate = usePermission(EXPENSE_UPDATE);
    const canDelete = usePermission(EXPENSE_DELETE);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isPaid, setIsPaid] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [from, setFrom] = useState<DateObject | null>(null);
    const [to, setTo] = useState<DateObject | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<IExpense | null>(null);
    const [deleting, setDeleting] = useState<IExpense | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    const params = {
        ...(search && { search }),
        ...(category && { category }),
        ...(isPaid && { is_paid: isPaid }),
        ...(supplierId && { supplier_id: supplierId }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate })
    };

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_ALL_EXPENSE, page, search, category, isPaid, supplierId, fromDate, toDate],
        ([url, pageNum]: [string, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: DEFAULT_PAGE_SIZE, ...params }
            })
    );

    const result: IExpenseListResponse | undefined = data?.data;

    const resetPage = () => setPage(1);

    const handleExport = async () => {
        setExporting(true);
        try {
            await downloadCsv(ApiKeys.GET_ALL_EXPENSE, params, 'expenses');
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            const response = await fetcher(ApiKeys.DELETE_EXPENSE(deleting.id), 'dashboard', 'DELETE');
            if (response?.success) {
                toast.success('هزینه حذف شد');
                mutate();
                setDeleting(null);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: ColumnDef<IExpense>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        { accessorKey: 'title', header: 'عنوان' },
        {
            accessorKey: 'category',
            header: 'دسته',
            cell: ({ row }) => {
                const config = EXPENSE_CATEGORY_CONFIG[row.original.category];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.category}</Badge>;
            }
        },
        {
            accessorKey: 'amount',
            header: 'مبلغ',
            cell: ({ row }) => formatToman(row.original.amount)
        },
        {
            accessorKey: 'is_paid',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Badge color={row.original.is_paid ? 'success' : 'warning'}>
                    {row.original.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                </Badge>
            )
        },
        {
            accessorKey: 'payment_method',
            header: 'روش پرداخت',
            cell: ({ row }) => paymentMethodLabel(row.original.payment_method)
        },
        {
            accessorKey: 'spent_at',
            header: 'تاریخ',
            cell: ({ row }) => formatDate(row.original.spent_at)
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Button
                        size='sm'
                        variant='outline'
                        className='text-nowrap'
                        disabled={!canUpdate}
                        onClick={() => {
                            setEditing(row.original);
                            setFormOpen(true);
                        }}
                    >
                        ویرایش
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='text-error-500 text-nowrap'
                        disabled={!canDelete}
                        onClick={() => setDeleting(row.original)}
                    >
                        حذف
                    </Button>
                </div>
            )
        }
    ];

    return (
        <ContentWrapper
            title='هزینه‌ها'
            extra={
                <div className='flex flex-wrap items-center gap-2'>
                    <Button size='sm' variant='outline' loading={exporting} onClick={handleExport}>
                        خروجی اکسل
                    </Button>
                    {canCreate && (
                        <Button
                            size='sm'
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        >
                            ثبت هزینه
                        </Button>
                    )}
                </div>
            }
        >
            <div className='mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
                <p className='text-xs text-gray-400'>مجموع هزینه‌های فیلتر شده</p>
                <p className='mt-1 text-xl font-bold text-gray-900 dark:text-white'>
                    {formatToman(result?.total_amount ?? 0)}
                </p>
            </div>

            <div className='mb-4 flex flex-wrap items-end gap-3'>
                <div className='w-full md:w-56'>
                    <label className='mb-1 block text-xs text-gray-400'>جست‌وجو (عنوان، یادداشت)</label>
                    <Input
                        name='search'
                        value={search}
                        placeholder='جست‌وجو...'
                        onChange={(e) => {
                            setSearch(e.target.value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-44'>
                    <label className='mb-1 block text-xs text-gray-400'>دسته</label>
                    <CSelect
                        name='category'
                        options={CATEGORY_FILTER_OPTIONS}
                        value={category}
                        onChange={(value) => {
                            setCategory(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-40'>
                    <label className='mb-1 block text-xs text-gray-400'>وضعیت پرداخت</label>
                    <CSelect
                        name='is_paid'
                        options={IS_PAID_OPTIONS}
                        value={isPaid}
                        onChange={(value) => {
                            setIsPaid(value);
                            resetPage();
                        }}
                    />
                </div>
                <div className='w-full md:w-56'>
                    <label className='mb-1 block text-xs text-gray-400'>تأمین‌کننده</label>
                    <SupplierSelect
                        value={supplierId}
                        onChange={(value) => {
                            setSupplierId(value);
                            resetPage();
                        }}
                        placeholder='همه تأمین‌کننده‌ها'
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

            <Table<IExpense>
                headerClass='text-nowrap'
                columns={columns}
                data={result?.expenses ?? []}
                loading={isLoading}
            />

            <Pagination
                currentPage={page}
                total={result?.pagination?.total ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
            />

            {formOpen && (
                <ExpenseForm
                    isOpen={formOpen}
                    expense={editing}
                    onClose={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                    mutate={mutate}
                />
            )}

            <DeleteModal
                isOpen={Boolean(deleting)}
                loading={deleteLoading}
                title='حذف هزینه'
                description='هزینه حذف می‌شود؛ تراکنش صندوقی که برای آن ثبت شده باقی می‌ماند.'
                onClose={() => setDeleting(null)}
                onDelete={handleDelete}
            />
        </ContentWrapper>
    );
};

export default ExpenseList;
