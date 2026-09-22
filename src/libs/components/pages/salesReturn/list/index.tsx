'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import {
    paymentMethodLabel,
    SALES_RETURN_CREATE,
    SALES_RETURN_VIEW
} from 'libs/constants/accounting/accounting.constants';
import {
    DEFAULT_PAGE_SIZE,
    formatDateTime,
    formatNumber,
    formatToman,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { ISalesReturn, ISalesReturnListResponse } from 'libs/models/accounting.model';
import { Badge, Button, DatePicker, Input, Table } from 'libs/ui';
import { downloadCsv } from 'libs/utilities';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import useSWR from 'swr';
import SalesReturnDetail from '../detail';
import SalesReturnForm from '../form';
import OrderPicker, { IPickerOrder } from '../orderPicker';

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className='mt-1 text-xl font-bold text-gray-900 dark:text-white'>{value}</p>
    </div>
);

const SalesReturnList = () => {
    const canCreate = usePermission(SALES_RETURN_CREATE);
    const canView = usePermission(SALES_RETURN_VIEW);

    const [page, setPage] = useState(1);
    const [orderId, setOrderId] = useState('');
    const [from, setFrom] = useState<DateObject | null>(null);
    const [to, setTo] = useState<DateObject | null>(null);

    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IPickerOrder | null>(null);
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';
    const orderFilter = orderId.trim();

    const params = {
        ...(orderFilter && { order_id: orderFilter }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate })
    };

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_ALL_SALES_RETURN, page, orderFilter, fromDate, toDate],
        ([url, pageNum]: [string, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: DEFAULT_PAGE_SIZE, ...params }
            })
    );

    const result: ISalesReturnListResponse | undefined = data?.data;

    const resetPage = () => setPage(1);

    const handleExport = async () => {
        setExporting(true);
        try {
            await downloadCsv(ApiKeys.GET_ALL_SALES_RETURN, params, 'sales-returns');
        } finally {
            setExporting(false);
        }
    };

    const columns: ColumnDef<ISalesReturn>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'returned_at',
            header: 'تاریخ',
            cell: ({ row }) => formatDateTime(row.original.returned_at)
        },
        {
            accessorKey: 'order_id',
            header: 'سفارش',
            cell: ({ row }) => (
                <span dir='ltr' className='font-mono text-xs'>
                    {row.original.order_id}
                </span>
            )
        },
        {
            id: 'items',
            header: 'اقلام',
            cell: ({ row }) => formatNumber(row.original.items.reduce((sum, item) => sum + item.quantity, 0))
        },
        {
            accessorKey: 'items_amount',
            header: 'ارزش اقلام',
            cell: ({ row }) => formatToman(row.original.items_amount)
        },
        {
            accessorKey: 'refund_amount',
            header: 'مبلغ استرداد',
            cell: ({ row }) => formatToman(row.original.refund_amount)
        },
        {
            accessorKey: 'is_refunded',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Badge color={row.original.is_refunded ? 'success' : 'warning'}>
                    {row.original.is_refunded
                        ? `مسترد شده (${paymentMethodLabel(row.original.refund_method)})`
                        : 'در انتظار استرداد'}
                </Badge>
            )
        },
        {
            accessorKey: 'reason',
            header: 'دلیل',
            cell: ({ row }) => row.original.reason || '-'
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    size='sm'
                    variant='outline'
                    className='text-nowrap'
                    disabled={!canView}
                    onClick={() => setViewingId(row.original.id)}
                >
                    جزئیات
                </Button>
            )
        }
    ];

    return (
        <ContentWrapper
            title='مرجوعی‌ها'
            extra={
                <div className='flex flex-wrap items-center gap-2'>
                    <Button size='sm' variant='outline' loading={exporting} onClick={handleExport}>
                        خروجی اکسل
                    </Button>
                    {canCreate && (
                        <Button size='sm' onClick={() => setPickerOpen(true)}>
                            ثبت مرجوعی
                        </Button>
                    )}
                </div>
            }
        >
            <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <StatCard label='تعداد مرجوعی' value={formatNumber(result?.summary?.count ?? 0)} />
                <StatCard label='ارزش اقلام' value={formatToman(result?.summary?.items_amount ?? 0)} />
                <StatCard label='مبلغ مسترد شده' value={formatToman(result?.summary?.refund_amount ?? 0)} />
                <StatCard label='بهای تمام‌شده برگشتی' value={formatToman(result?.summary?.returned_cost ?? 0)} />
            </div>

            <div className='mb-4 flex flex-wrap items-end gap-3'>
                <div className='w-full md:w-72'>
                    <label className='mb-1 block text-xs text-gray-400'>شماره سفارش</label>
                    <Input
                        name='order_id'
                        dir='ltr'
                        value={orderId}
                        onChange={(e) => {
                            setOrderId(e.target.value);
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

            <Table<ISalesReturn>
                headerClass='text-nowrap'
                columns={columns}
                data={result?.sales_returns ?? []}
                loading={isLoading}
            />

            <Pagination
                currentPage={page}
                total={result?.pagination?.total ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
            />

            {pickerOpen && (
                <OrderPicker
                    isOpen={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={(order) => {
                        setPickerOpen(false);
                        setSelectedOrder(order);
                    }}
                />
            )}

            {selectedOrder && (
                <SalesReturnForm
                    isOpen={Boolean(selectedOrder)}
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    mutate={mutate}
                />
            )}

            {viewingId && (
                <SalesReturnDetail
                    isOpen={Boolean(viewingId)}
                    id={viewingId}
                    onClose={() => setViewingId(null)}
                    mutate={mutate}
                />
            )}
        </ContentWrapper>
    );
};

export default SalesReturnList;
