'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import SupplierSelect from 'libs/components/pages/supplier/select';
import ROUTES from 'libs/constants/routes/routes.constants';
import {
    DEFAULT_PAGE_SIZE,
    formatDate,
    formatNumber,
    formatToman,
    PAYMENT_STATE_CONFIG,
    PAYMENT_STATE_OPTIONS,
    PURCHASE_CREATE,
    PURCHASE_STATUS_CONFIG,
    PURCHASE_STATUS_OPTIONS,
    PURCHASE_VIEW,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IPurchase } from 'libs/models/warehouse.model';
import { Badge, CSelect, DatePicker, Link, Table } from 'libs/ui';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import useSWR from 'swr';

const PurchaseList = () => {
    const canCreate = usePermission(PURCHASE_CREATE);
    const canView = usePermission(PURCHASE_VIEW);

    const [page, setPage] = useState(1);
    const [supplierId, setSupplierId] = useState('');
    const [status, setStatus] = useState('');
    const [paymentState, setPaymentState] = useState('');
    const [from, setFrom] = useState<DateObject | null>(null);
    const [to, setTo] = useState<DateObject | null>(null);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_ALL_PURCHASE, page, supplierId, status, paymentState, fromDate, toDate],
        ([url, pageNum, supplier, statusValue, payment, fromValue, toValue]: [
            string,
            number,
            string,
            string,
            string,
            string,
            string
        ]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: {
                    page_number: pageNum,
                    page_size: DEFAULT_PAGE_SIZE,
                    ...(supplier && { supplier_id: supplier }),
                    ...(statusValue && { status: statusValue }),
                    ...(payment && { payment_state: payment }),
                    ...(fromValue && { from: fromValue }),
                    ...(toValue && { to: toValue })
                }
            })
    );

    const columns: ColumnDef<IPurchase>[] = [
        {
            accessorKey: 'invoice_number',
            header: 'شماره فاکتور',
            cell: ({ row }) => row.original.invoice_number || '-'
        },
        {
            accessorKey: 'supplier_name',
            header: 'تأمین‌کننده',
            cell: ({ row }) => row.original.supplier_name || '-'
        },
        {
            id: 'items_count',
            header: 'تعداد اقلام',
            cell: ({ row }) => formatNumber(row.original.items?.length ?? 0)
        },
        {
            accessorKey: 'total_amount',
            header: 'مبلغ کل',
            cell: ({ row }) => formatToman(row.original.total_amount)
        },
        {
            accessorKey: 'payment_state',
            header: 'وضعیت پرداخت',
            cell: ({ row }) => {
                const config = PAYMENT_STATE_CONFIG[row.original.payment_state];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.payment_state}</Badge>;
            }
        },
        {
            accessorKey: 'status',
            header: 'وضعیت فاکتور',
            cell: ({ row }) => {
                const config = PURCHASE_STATUS_CONFIG[row.original.status];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.status}</Badge>;
            }
        },
        {
            accessorKey: 'purchased_at',
            header: 'تاریخ خرید',
            cell: ({ row }) => formatDate(row.original.purchased_at)
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) =>
                canView ? (
                    <Link
                        href={ROUTES.PurchaseDetail(row.original.id)}
                        className='text-brand-500 text-nowrap text-sm font-medium'
                    >
                        جزئیات
                    </Link>
                ) : (
                    <span className='text-xs text-gray-400'>-</span>
                )
        }
    ];

    return (
        <ContentWrapper
            title='فاکتورهای خرید'
            extra={
                canCreate ? (
                    <Link
                        href={ROUTES.CreatePurchase}
                        className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    >
                        ثبت فاکتور خرید
                    </Link>
                ) : undefined
            }
        >
            <div className='mb-4 grid grid-cols-1 gap-3 md:grid-cols-5'>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>تأمین‌کننده</label>
                    <SupplierSelect
                        value={supplierId}
                        onChange={(value) => {
                            setSupplierId(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>وضعیت فاکتور</label>
                    <CSelect
                        name='status'
                        options={[{ value: '', label: 'همه' }, ...PURCHASE_STATUS_OPTIONS]}
                        value={status}
                        onChange={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>وضعیت پرداخت</label>
                    <CSelect
                        name='payment_state'
                        options={[{ value: '', label: 'همه' }, ...PAYMENT_STATE_OPTIONS]}
                        value={paymentState}
                        onChange={(value) => {
                            setPaymentState(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>از تاریخ</label>
                    <DatePicker
                        name='from'
                        value={from ?? undefined}
                        onChange={(value) => {
                            setFrom(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>تا تاریخ</label>
                    <DatePicker
                        name='to'
                        value={to ?? undefined}
                        onChange={(value) => {
                            setTo(value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <Table<IPurchase>
                headerClass='text-nowrap'
                columns={columns}
                data={data?.data?.purchases ?? []}
                loading={isLoading}
            />

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
            />
        </ContentWrapper>
    );
};

export default PurchaseList;
