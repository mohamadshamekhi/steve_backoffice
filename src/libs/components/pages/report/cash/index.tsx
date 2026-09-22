'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import Chart from 'libs/components/common/ApexChartClient';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import {
    CASH_DIRECTION_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    paymentMethodLabel
} from 'libs/constants/accounting/accounting.constants';
import { formatDate, formatToman, signedClass } from 'libs/constants/warehouse/warehouse.constants';
import { ICashDayRow, ICashMethodRow, ICashReport } from 'libs/models/accounting.model';
import { CSelect, Table } from 'libs/ui';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { DateRangeFilter, ExportButton, StatCard, useDateRange } from '../shared';

const DIRECTION_FILTER_OPTIONS = [{ value: '', label: 'همه' }, ...CASH_DIRECTION_OPTIONS];
const METHOD_FILTER_OPTIONS = [{ value: '', label: 'همه روش‌ها' }, ...PAYMENT_METHOD_OPTIONS];

const amountCells = <T extends { total_in: number; total_out: number; balance: number }>(): ColumnDef<T>[] => [
    { accessorKey: 'total_in', header: 'دریافتی', cell: ({ row }) => formatToman(row.original.total_in) },
    { accessorKey: 'total_out', header: 'پرداختی', cell: ({ row }) => formatToman(row.original.total_out) },
    {
        accessorKey: 'balance',
        header: 'مانده',
        cell: ({ row }) => <span className={signedClass(row.original.balance)}>{formatToman(row.original.balance)}</span>
    }
];

const CashReport = () => {
    const range = useDateRange();
    const [direction, setDirection] = useState('');
    const [method, setMethod] = useState('');

    const params = {
        ...(range.fromDate && { from: range.fromDate }),
        ...(range.toDate && { to: range.toDate }),
        ...(direction && { direction }),
        ...(method && { method })
    };

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REPORT_CASH, range.fromDate, range.toDate, direction, method],
        ([url]: [string]) => fetcher(url, 'dashboard', 'GET', { params })
    );

    const report: ICashReport | undefined = data?.data;
    const byDay = useMemo(() => [...(report?.by_day ?? [])].sort((a, b) => a.day.localeCompare(b.day)), [report]);

    const methodColumns: ColumnDef<ICashMethodRow>[] = [
        { accessorKey: 'method', header: 'روش پرداخت', cell: ({ row }) => paymentMethodLabel(row.original.method) },
        ...amountCells<ICashMethodRow>()
    ];

    const dayColumns: ColumnDef<ICashDayRow>[] = [
        { accessorKey: 'day', header: 'تاریخ', cell: ({ row }) => formatDate(row.original.day) },
        ...amountCells<ICashDayRow>()
    ];

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <StatCard label='دریافتی' value={formatToman(report?.summary?.total_in ?? 0)} />
                <StatCard label='پرداختی' value={formatToman(report?.summary?.total_out ?? 0)} />
                <StatCard
                    label='مانده'
                    value={formatToman(report?.summary?.balance ?? 0)}
                    valueClass={signedClass(report?.summary?.balance)}
                />
            </div>

            <ContentWrapper
                title='گزارش صندوق'
                extra={<ExportButton path={ApiKeys.GET_REPORT_CASH} params={params} fileName='cash-report' />}
            >
                <div className='mb-4 flex flex-wrap items-end gap-3'>
                    <DateRangeFilter {...range} />
                    <div className='w-full md:w-36'>
                        <label className='mb-1 block text-xs text-gray-400'>نوع</label>
                        <CSelect name='direction' options={DIRECTION_FILTER_OPTIONS} value={direction} onChange={setDirection} />
                    </div>
                    <div className='w-full md:w-48'>
                        <label className='mb-1 block text-xs text-gray-400'>روش پرداخت</label>
                        <CSelect name='method' options={METHOD_FILTER_OPTIONS} value={method} onChange={setMethod} />
                    </div>
                </div>

                {byDay.length > 0 && (
                    <div className='mb-6' dir='ltr'>
                        <Chart
                            type='bar'
                            height={280}
                            options={{
                                chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                                dataLabels: { enabled: false },
                                plotOptions: { bar: { columnWidth: '45%', borderRadius: 3 } },
                                colors: ['#12b76a', '#f04438'],
                                xaxis: { categories: byDay.map((row) => formatDate(row.day)) },
                                yaxis: { labels: { formatter: (value: number) => Number(value).toLocaleString('fa-IR') } },
                                tooltip: { y: { formatter: (value: number) => formatToman(value) } },
                                legend: { position: 'top', horizontalAlign: 'right' }
                            }}
                            series={[
                                { name: 'دریافتی', data: byDay.map((row) => row.total_in) },
                                { name: 'پرداختی', data: byDay.map((row) => row.total_out) }
                            ]}
                        />
                    </div>
                )}

                <h4 className='mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>به تفکیک روش پرداخت</h4>
                <Table<ICashMethodRow>
                    headerClass='text-nowrap'
                    columns={methodColumns}
                    data={report?.by_method ?? []}
                    loading={isLoading}
                />

                <h4 className='mt-6 mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>روزانه</h4>
                <Table<ICashDayRow> headerClass='text-nowrap' columns={dayColumns} data={byDay} loading={isLoading} />
            </ContentWrapper>
        </div>
    );
};

export default CashReport;
