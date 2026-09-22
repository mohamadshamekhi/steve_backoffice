'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import SupplierSelect from 'libs/components/pages/supplier/select';
import { formatDate, formatNumber, formatToman, signedClass } from 'libs/constants/warehouse/warehouse.constants';
import { ISupplierLedgerReport, ISupplierLedgerRow } from 'libs/models/accounting.model';
import { Switch, Table } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';
import { DateRangeFilter, ExportButton, StatCard, useDateRange } from '../shared';

const SupplierLedgerReport = () => {
    const range = useDateRange(false);
    const [supplierId, setSupplierId] = useState('');
    const [onlyDebt, setOnlyDebt] = useState(true);

    const params = {
        ...(range.fromDate && { from: range.fromDate }),
        ...(range.toDate && { to: range.toDate }),
        ...(supplierId && { supplier_id: supplierId }),
        ...(onlyDebt && { only_debt: true })
    };

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REPORT_SUPPLIER_LEDGER, range.fromDate, range.toDate, supplierId, onlyDebt],
        ([url]: [string]) => fetcher(url, 'dashboard', 'GET', { params })
    );

    const report: ISupplierLedgerReport | undefined = data?.data;

    const columns: ColumnDef<ISupplierLedgerRow>[] = [
        { accessorKey: 'supplier_name', header: 'تأمین‌کننده', cell: ({ row }) => row.original.supplier_name || '-' },
        { accessorKey: 'invoice_count', header: 'تعداد فاکتور', cell: ({ row }) => formatNumber(row.original.invoice_count) },
        { accessorKey: 'total_purchased', header: 'کل خرید', cell: ({ row }) => formatToman(row.original.total_purchased) },
        { accessorKey: 'total_paid', header: 'پرداخت شده', cell: ({ row }) => formatToman(row.original.total_paid) },
        {
            accessorKey: 'balance',
            header: 'مانده بدهی',
            // مانده‌ی مثبت بدهی ماست، پس رنگ‌بندی برعکس سود است.
            cell: ({ row }) => (
                <span className={signedClass(-row.original.balance)}>
                    {row.original.balance < 0 ? `پیش‌پرداخت ${formatToman(-row.original.balance)}` : formatToman(row.original.balance)}
                </span>
            )
        },
        { accessorKey: 'last_purchase_at', header: 'آخرین خرید', cell: ({ row }) => formatDate(row.original.last_purchase_at) }
    ];

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <StatCard label='کل خرید' value={formatToman(report?.total_purchased)} />
                <StatCard label='پرداخت شده' value={formatToman(report?.total_paid)} />
                <StatCard
                    label='کل بدهی به تأمین‌کنندگان'
                    value={formatToman(report?.total_debt)}
                    valueClass={signedClass(-(report?.total_debt ?? 0))}
                />
            </div>

            <ContentWrapper
                title='حساب تأمین‌کنندگان'
                extra={
                    <ExportButton path={ApiKeys.GET_REPORT_SUPPLIER_LEDGER} params={params} fileName='supplier-ledger' />
                }
            >
                <div className='mb-4 flex flex-wrap items-end gap-3'>
                    <div className='w-full md:w-60'>
                        <label className='mb-1 block text-xs text-gray-400'>تأمین‌کننده</label>
                        <SupplierSelect value={supplierId} onChange={setSupplierId} placeholder='همه تأمین‌کننده‌ها' />
                    </div>
                    <DateRangeFilter {...range} />
                    <div>
                        <label className='mb-1 block text-xs text-gray-400'>فقط بدهکارها</label>
                        <Switch name='only_debt' checked={onlyDebt} onChange={setOnlyDebt} size='md' variant='primary' />
                    </div>
                </div>

                <Table<ISupplierLedgerRow>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={report?.rows ?? []}
                    loading={isLoading}
                />
            </ContentWrapper>
        </div>
    );
};

export default SupplierLedgerReport;
