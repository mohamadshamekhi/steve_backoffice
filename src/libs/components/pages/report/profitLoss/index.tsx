'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { EXPENSE_CATEGORY_CONFIG, formatPercent } from 'libs/constants/accounting/accounting.constants';
import { formatNumber, formatToman, signedClass } from 'libs/constants/warehouse/warehouse.constants';
import { IProfitLossReport } from 'libs/models/accounting.model';
import useSWR from 'swr';
import { DateRangeFilter, ExportButton, StatCard, useDateRange } from '../shared';

type LineKind = 'plus' | 'minus' | 'total';

const Line = ({ label, value, kind, signed }: { label: string; value?: number; kind: LineKind; signed?: boolean }) => (
    <div
        className={`flex items-center justify-between py-3 text-sm ${
            kind === 'total'
                ? 'border-t-2 border-gray-200 font-bold text-gray-900 dark:border-gray-700 dark:text-white'
                : 'border-b border-gray-100 text-gray-600 dark:border-gray-800 dark:text-gray-300'
        }`}
    >
        <span>
            {kind === 'minus' && <span className='text-error-500 ml-1'>−</span>}
            {label}
        </span>
        <span className={signed ? signedClass(value) : ''}>{formatToman(value ?? 0)}</span>
    </div>
);

const ProfitLossReport = () => {
    const range = useDateRange();

    const params = {
        ...(range.fromDate && { from: range.fromDate }),
        ...(range.toDate && { to: range.toDate })
    };

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REPORT_PROFIT_LOSS, range.fromDate, range.toDate],
        ([url]: [string]) => fetcher(url, 'dashboard', 'GET', { params })
    );

    const report: IProfitLossReport | undefined = data?.data;
    const breakdown = [...(report?.expense_breakdown ?? [])].sort((a, b) => b.amount - a.amount);
    const maxExpense = breakdown[0]?.amount || 1;

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <StatCard label='فروش خالص' value={formatToman(report?.net_revenue)} hint={`${formatNumber(report?.units_sold)} واحد فروش`} />
                <StatCard
                    label='سود ناخالص'
                    value={formatToman(report?.gross_profit)}
                    valueClass={signedClass(report?.gross_profit)}
                    hint={`حاشیه ${formatPercent(report?.gross_margin_percent)}`}
                />
                <StatCard label='هزینه‌های عملیاتی' value={formatToman(report?.expenses)} />
                <StatCard
                    label='سود خالص'
                    value={formatToman(report?.net_profit)}
                    valueClass={signedClass(report?.net_profit)}
                    hint={`حاشیه ${formatPercent(report?.net_margin_percent)}`}
                />
            </div>

            <ContentWrapper
                title='صورت سود و زیان'
                extra={<ExportButton path={ApiKeys.GET_REPORT_PROFIT_LOSS} params={params} fileName='profit-loss' />}
            >
                <div className='mb-4 flex flex-wrap items-end gap-3'>
                    <DateRangeFilter {...range} />
                </div>

                <p className='mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-gray-400'>
                    سود بر اساس دفتر حرکت کالا (تعهدی) محاسبه می‌شود و با مانده‌ی صندوق (نقدی) برابر نیست؛ نسیه،
                    پیش‌پرداخت و هزینه‌های پرداخت‌نشده این اختلاف را ایجاد می‌کنند.
                </p>

                {isLoading ? (
                    <p className='py-16 text-center text-sm text-gray-400'>در حال بارگذاری...</p>
                ) : (
                    <div className='grid grid-cols-1 gap-8 xl:grid-cols-2'>
                        <div>
                            <Line label='فروش' value={report?.revenue} kind='plus' />
                            <Line label='برگشت از فروش' value={report?.returns} kind='minus' />
                            <Line label='فروش خالص' value={report?.net_revenue} kind='total' />
                            <Line label='بهای تمام‌شده کالای فروش‌رفته' value={report?.cogs} kind='plus' />
                            <Line label='بهای تمام‌شده کالای برگشتی' value={report?.returned_cost} kind='minus' />
                            <Line label='بهای تمام‌شده خالص' value={report?.net_cogs} kind='total' />
                            <Line label='سود ناخالص' value={report?.gross_profit} kind='total' signed />
                            <Line label='هزینه‌های عملیاتی' value={report?.expenses} kind='minus' />
                            <Line label='سود خالص' value={report?.net_profit} kind='total' signed />
                        </div>

                        <div>
                            <h4 className='mb-3 text-sm font-medium text-gray-800 dark:text-white/90'>هزینه‌ها به تفکیک دسته</h4>
                            {breakdown.length === 0 ? (
                                <p className='py-10 text-center text-sm text-gray-400'>هزینه‌ای در این بازه ثبت نشده.</p>
                            ) : (
                                <ul className='space-y-3'>
                                    {breakdown.map((row) => (
                                        <li key={row.category}>
                                            <div className='mb-1 flex items-center justify-between text-sm'>
                                                <span className='text-gray-700 dark:text-gray-300'>
                                                    {EXPENSE_CATEGORY_CONFIG[row.category]?.label ?? row.category}
                                                    <span className='mr-2 text-xs text-gray-400'>({formatNumber(row.count)} مورد)</span>
                                                </span>
                                                <span className='text-gray-900 dark:text-white'>{formatToman(row.amount)}</span>
                                            </div>
                                            <div className='h-2 rounded-full bg-gray-100 dark:bg-gray-800'>
                                                <div
                                                    className='bg-brand-500 h-2 rounded-full'
                                                    style={{ width: `${(row.amount / maxExpense) * 100}%` }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </ContentWrapper>
        </div>
    );
};

export default ProfitLossReport;
