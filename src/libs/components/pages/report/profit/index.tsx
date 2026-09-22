'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import Chart from 'libs/components/common/ApexChartClient';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { loadSupplierOptions } from 'libs/components/pages/supplier/select';
import {
    formatDate,
    formatNumber,
    formatToman,
    PROFIT_GROUP_TABS,
    signedClass,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { IProfitReport, IProfitRow, ProfitGroupBy } from 'libs/models/warehouse.model';
import { DatePicker, Table } from 'libs/ui';
import { useEffect, useMemo, useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import useSWR from 'swr';
import { ExportButton } from '../shared';

const StatCard = ({ label, value, valueClass = '' }: { label: string; value: React.ReactNode; valueClass?: string }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-white ${valueClass}`}>{value}</p>
    </div>
);

const startOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

const ProfitReport = () => {
    const [groupBy, setGroupBy] = useState<ProfitGroupBy>('day');
    const [from, setFrom] = useState<DateObject | null>(new DateObject(startOfMonth()));
    const [to, setTo] = useState<DateObject | null>(new DateObject(new Date()));
    const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REPORT_PROFIT, fromDate, toDate, groupBy],
        ([url, fromValue, toValue, group]: [string, string, string, ProfitGroupBy]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: {
                    ...(fromValue && { from: fromValue }),
                    ...(toValue && { to: toValue }),
                    group_by: group
                }
            })
    );

    const report: IProfitReport | undefined = data?.data;
    const rows = useMemo(() => report?.rows ?? [], [report]);

    // `group_by=supplier` returns ids without labels, so supplier names are resolved here.
    useEffect(() => {
        if (groupBy !== 'supplier' || rows.length === 0) return;
        loadSupplierOptions('').then((options) => {
            setSupplierNames(Object.fromEntries(options.map((option) => [option.value, option.label])));
        });
    }, [groupBy, rows.length]);

    const labelOf = (row: IProfitRow) => {
        if (groupBy === 'day') return formatDate(row.key);
        if (groupBy === 'supplier') return row.label || supplierNames[row.key] || row.key;
        return row.label || row.key;
    };

    const columns: ColumnDef<IProfitRow>[] = [
        {
            accessorKey: 'key',
            header: groupBy === 'day' ? 'تاریخ' : groupBy === 'product' ? 'محصول' : 'تأمین‌کننده',
            cell: ({ row }) => labelOf(row.original)
        },
        {
            accessorKey: 'units_sold',
            header: 'تعداد فروش',
            cell: ({ row }) => formatNumber(row.original.units_sold)
        },
        {
            accessorKey: 'revenue',
            header: 'فروش',
            cell: ({ row }) => formatToman(row.original.revenue)
        },
        {
            accessorKey: 'cost',
            header: 'قیمت تمام‌شده',
            cell: ({ row }) => formatToman(row.original.cost)
        },
        {
            accessorKey: 'gross_profit',
            header: 'سود ناخالص',
            cell: ({ row }) => (
                <span className={signedClass(row.original.gross_profit)}>{formatToman(row.original.gross_profit)}</span>
            )
        }
    ];

    const chartRows = useMemo(() => [...rows].sort((a, b) => a.key.localeCompare(b.key)), [rows]);

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <StatCard label='تعداد فروش' value={formatNumber(report?.summary?.units_sold ?? 0)} />
                <StatCard label='فروش کل' value={formatToman(report?.summary?.revenue ?? 0)} />
                <StatCard label='قیمت تمام‌شده' value={formatToman(report?.summary?.cost ?? 0)} />
                <StatCard
                    label='سود ناخالص'
                    value={formatToman(report?.summary?.gross_profit ?? 0)}
                    valueClass={signedClass(report?.summary?.gross_profit)}
                />
            </div>

            <ContentWrapper
                title='گزارش سود و زیان'
                extra={
                    <ExportButton
                        path={ApiKeys.GET_REPORT_PROFIT}
                        params={{ ...(fromDate && { from: fromDate }), ...(toDate && { to: toDate }), group_by: groupBy }}
                        fileName={`profit-${groupBy}`}
                    />
                }
            >
                <div className='mb-4 flex flex-wrap items-end gap-3'>
                    <div className='w-full md:w-44'>
                        <label className='mb-1 block text-xs text-gray-400'>از تاریخ</label>
                        <DatePicker name='from' value={from ?? undefined} onChange={setFrom} />
                    </div>
                    <div className='w-full md:w-44'>
                        <label className='mb-1 block text-xs text-gray-400'>تا تاریخ</label>
                        <DatePicker name='to' value={to ?? undefined} onChange={setTo} />
                    </div>
                </div>

                <nav className='mb-4 flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900'>
                    {PROFIT_GROUP_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            type='button'
                            onClick={() => setGroupBy(tab.value)}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                groupBy === tab.value
                                    ? 'shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.03] dark:text-white'
                                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {groupBy === 'day' && chartRows.length > 0 && (
                    <div className='mb-6' dir='ltr'>
                        <Chart
                            type='line'
                            height={280}
                            options={{
                                chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                                stroke: { curve: 'smooth', width: 2 },
                                dataLabels: { enabled: false },
                                colors: ['#465fff', '#12b76a'],
                                xaxis: { categories: chartRows.map((row) => row.key) },
                                yaxis: {
                                    labels: {
                                        formatter: (value: number) => Number(value).toLocaleString('fa-IR')
                                    }
                                },
                                tooltip: {
                                    y: { formatter: (value: number) => `${Number(value).toLocaleString('fa-IR')} تومان` }
                                },
                                legend: { position: 'top', horizontalAlign: 'right' }
                            }}
                            series={[
                                { name: 'فروش', data: chartRows.map((row) => row.revenue) },
                                { name: 'سود ناخالص', data: chartRows.map((row) => row.gross_profit) }
                            ]}
                        />
                    </div>
                )}

                <Table<IProfitRow> headerClass='text-nowrap' columns={columns} data={rows} loading={isLoading} />
            </ContentWrapper>
        </div>
    );
};

export default ProfitReport;
