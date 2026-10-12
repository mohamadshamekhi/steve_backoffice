'use client';

import type ApexCharts from 'apexcharts';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import Chart from 'libs/components/common/ApexChartClient';
import { EXPENSE_CATEGORY_CONFIG, formatPercent, paymentMethodLabel } from 'libs/constants/accounting/accounting.constants';
import ROUTES from 'libs/constants/routes/routes.constants';
import { describeAttributes, formatNumber, formatToman, signedClass, toIsoDate } from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IDashboardOverview } from 'libs/models/dashboard.model';
import { IPriceReviewListResponse } from 'libs/models/priceReview.model';
import { PRICE_REVIEW_VIEW } from 'libs/components/pages/priceReview/constants';
import { Badge } from 'libs/ui';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
    BarRow,
    changePercent,
    compactToman,
    DeltaBadge,
    Empty,
    Icons,
    KpiCard,
    MiniStat,
    Money,
    Panel,
    Period,
    PERIOD_OPTIONS,
    periodRange,
    Skeleton
} from './widgets';

type BadgeColor = React.ComponentProps<typeof Badge>['color'];

const ORDER_STATUS: Record<string, { label: string; color: BadgeColor; bar: string }> = {
    pending_payment: { label: 'در انتظار پرداخت', color: 'warning', bar: 'bg-warning-400' },
    processing: { label: 'در حال پردازش', color: 'info', bar: 'bg-blue-light-500' },
    shipped: { label: 'ارسال شده', color: 'primary', bar: 'bg-brand-500' },
    delivered: { label: 'تحویل داده شده', color: 'success', bar: 'bg-success-500' },
    cancelled: { label: 'لغو شده', color: 'error', bar: 'bg-error-400' },
    refunded: { label: 'مرجوع شده', color: 'dark', bar: 'bg-gray-500' }
};

const shortDay = (key: string) => {
    const date = new Date(key);
    return Number.isNaN(date.getTime()) ? key : date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
};

const baseChart: ApexCharts.ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit', zoom: { enabled: false } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(148,163,184,0.18)', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', labels: { colors: '#98a2b3' } },
    yaxis: { labels: { formatter: (value: number) => compactToman(value), style: { colors: '#98a2b3' } } },
    tooltip: { y: { formatter: (value: number) => formatToman(value) } }
};

const xaxis = (categories: string[]): ApexCharts.ApexOptions['xaxis'] => ({
    categories,
    labels: { style: { colors: '#98a2b3' }, rotate: 0, hideOverlappingLabels: true },
    tickAmount: Math.min(categories.length, 10),
    axisBorder: { show: false },
    axisTicks: { show: false }
});

const OverviewDashboard = () => {
    const canViewPriceReview = usePermission(PRICE_REVIEW_VIEW);
    const { data: priceReviewData, isLoading: isPriceReviewLoading } = useSWR(
        canViewPriceReview ? [ApiKeys.GET_PRICE_REVIEW_LIST, 1] : null,
        ([url]: [string]) => fetcher(url, 'dashboard', 'GET', { params: { page_number: 1, page_size: 1 } })
    );
    const priceReviewTotal = (priceReviewData?.data as IPriceReviewListResponse | undefined)?.total ?? 0;

    const [period, setPeriod] = useState<Period>('30d');
    const periodMeta = PERIOD_OPTIONS.find((option) => option.value === period)!;

    const params = useMemo(() => {
        const { from, to } = periodRange(period);
        return { from: toIsoDate(from), to: toIsoDate(to) };
    }, [period]);

    const { data, error, isLoading } = useSWR([ApiKeys.GET_DASHBOARD_OVERVIEW, params.from, params.to], ([url]: [string]) =>
        fetcher(url, 'dashboard', 'GET', { params })
    );
    const overview: IDashboardOverview | undefined = data?.success === false ? undefined : data?.data;

    // تا پاسخ نیامده همه‌ی بخش‌ها اسکلتون دارند؛ بعد از آن بخش `null` (بدون مجوز) پنهان می‌شود.
    const show = (section: unknown) => isLoading || (overview !== undefined && section !== null && section !== undefined);

    const sales = overview?.sales;
    const cash = overview?.cash;
    const inventory = overview?.inventory;
    const trend = overview?.trend ?? [];
    const cashDays = cash?.by_day ?? [];
    const cashMethods = (cash?.by_method ?? []).filter((row) => row.total_in > 0);
    const products = overview?.top_products ?? [];
    const maxProductProfit = Math.max(...products.map((row) => row.gross_profit), 1);
    const expenses = [...(overview?.expense_breakdown ?? [])].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const statuses = [...(overview?.orders_by_status ?? [])].filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
    const statusTotal = statuses.reduce((sum, row) => sum + row.count, 0);

    const compare = periodMeta.compare;
    const todayLabel = new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className='space-y-6'>
            {/* ------------------------------- header ------------------------------- */}
            <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                <div>
                    <h1 className='text-xl font-bold text-gray-900 dark:text-white'>گزارش کلی کسب‌وکار</h1>
                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{todayLabel}</p>
                </div>
                <div
                    role='tablist'
                    aria-label='بازه‌ی گزارش'
                    className='inline-flex w-full rounded-xl border border-gray-200 bg-white p-1 md:w-auto dark:border-gray-800 dark:bg-white/[0.03]'
                >
                    {PERIOD_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type='button'
                            role='tab'
                            aria-selected={period === option.value}
                            onClick={() => setPeriod(option.value)}
                            className={`min-h-9 flex-1 rounded-lg px-4 text-sm font-medium transition-colors md:flex-none ${
                                period === option.value
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {(error || data?.success === false) && !isLoading && (
                <div className='border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400 rounded-2xl border p-4 text-sm'>
                    دریافت گزارش داشبورد با خطا مواجه شد. دوباره تلاش کنید.
                </div>
            )}

            {/* -------------------------------- KPIs -------------------------------- */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {show(sales) && (
                    <KpiCard
                        label='فروش خالص'
                        tone='brand'
                        icon={Icons.revenue}
                        href={ROUTES.ProfitLossReport}
                        loading={isLoading}
                        value={<Money value={sales?.net_revenue} />}
                        title={formatToman(sales?.net_revenue)}
                        footer={
                            <>
                                <DeltaBadge value={changePercent(sales?.net_revenue, sales?.net_revenue_prev)} label={compare} />
                                <span className='ms-auto'>{formatNumber(sales?.units_sold)} واحد</span>
                            </>
                        }
                    />
                )}
                {show(sales) && (
                    <KpiCard
                        label='سود خالص'
                        tone={(sales?.net_profit ?? 0) < 0 ? 'error' : 'success'}
                        icon={Icons.profit}
                        href={ROUTES.ProfitLossReport}
                        loading={isLoading}
                        value={<Money value={sales?.net_profit} signed />}
                        title={formatToman(sales?.net_profit)}
                        footer={
                            <>
                                <DeltaBadge value={changePercent(sales?.net_profit, sales?.net_profit_prev)} label={compare} />
                                <span className='ms-auto'>حاشیه {formatPercent(sales?.net_margin_percent)}</span>
                            </>
                        }
                    />
                )}
                {show(cash) && (
                    <KpiCard
                        label='جریان نقدی صندوق'
                        tone='warning'
                        icon={Icons.cash}
                        href={ROUTES.CashReport}
                        loading={isLoading}
                        value={<Money value={cash?.balance} signed />}
                        title={formatToman(cash?.balance)}
                        footer={
                            <>
                                <span>دریافتی {compactToman(cash?.total_in)}</span>
                                <span className='ms-auto'>پرداختی {compactToman(cash?.total_out)}</span>
                            </>
                        }
                    />
                )}
                {show(inventory) && (
                    <KpiCard
                        label='ارزش موجودی انبار'
                        tone='gray'
                        icon={Icons.box}
                        href={ROUTES.InventoryStock}
                        loading={isLoading}
                        value={<Money value={inventory?.total_stock_value} />}
                        title={formatToman(inventory?.total_stock_value)}
                        footer={<span>{formatNumber(inventory?.total_units)} واحد در انبار</span>}
                    />
                )}
            </div>

            {/* ---------------------------- secondary ---------------------------- */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {show(sales) && (
                    <MiniStat
                        label='تعداد سفارش'
                        loading={isLoading}
                        href={ROUTES.Orders}
                        value={formatNumber(sales?.order_count)}
                        hint={
                            <>
                                <DeltaBadge value={changePercent(sales?.order_count, sales?.order_count_prev)} />
                                <span>میانگین {compactToman(sales?.avg_order_value)}</span>
                            </>
                        }
                    />
                )}
                {show(overview?.customers) && (
                    <MiniStat
                        label='مشتری جدید'
                        loading={isLoading}
                        value={formatNumber(overview?.customers?.new_count)}
                        hint={<DeltaBadge value={changePercent(overview?.customers?.new_count, overview?.customers?.new_count_prev)} />}
                    />
                )}
                {show(overview?.repairs) && (
                    <MiniStat label='تعمیرات باز' loading={isLoading} href={ROUTES.Repairs} value={formatNumber(overview?.repairs?.open_count)} />
                )}
                {canViewPriceReview && (
                    <MiniStat
                        label='نیاز به بازبینی قیمت'
                        loading={isPriceReviewLoading}
                        href={ROUTES.PriceReview}
                        value={formatNumber(priceReviewTotal)}
                        urgent={priceReviewTotal > 0}
                    />
                )}
            </div>

            {/* --------------------------- trend + P&L --------------------------- */}
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
                {show(overview?.trend) && (
                    <Panel className='xl:col-span-2' title='روند فروش و سود' subtitle={`بازه‌ی ${periodMeta.label}`} href={ROUTES.ProfitReport}>
                        {isLoading ? (
                            <Skeleton className='h-72' />
                        ) : trend.every((row) => !row.revenue && !row.gross_profit) ? (
                            <Empty text='در این بازه فروشی ثبت نشده است.' />
                        ) : (
                            <div dir='ltr'>
                                <Chart
                                    type={trend.length > 2 ? 'area' : 'bar'}
                                    height={290}
                                    options={{
                                        ...baseChart,
                                        colors: ['#465fff', '#12b76a'],
                                        stroke: { curve: 'smooth', width: trend.length > 2 ? 2 : 0 },
                                        fill:
                                            trend.length > 2
                                                ? { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } }
                                                : { opacity: 1 },
                                        plotOptions: { bar: { columnWidth: '30%', borderRadius: 4, borderRadiusApplication: 'end' } },
                                        xaxis: xaxis(trend.map((row) => shortDay(row.day)))
                                    }}
                                    series={[
                                        { name: 'فروش', data: trend.map((row) => row.revenue) },
                                        { name: 'سود ناخالص', data: trend.map((row) => row.gross_profit) }
                                    ]}
                                />
                            </div>
                        )}
                    </Panel>
                )}

                {show(sales) && (
                    <Panel title='صورت سود و زیان' subtitle={`بازه‌ی ${periodMeta.label}`} href={ROUTES.ProfitLossReport}>
                        {isLoading ? (
                            <Skeleton className='h-72' />
                        ) : (
                            <dl className='divide-y divide-gray-100 text-sm dark:divide-gray-800'>
                                {[
                                    { label: 'فروش', value: sales?.revenue },
                                    { label: 'مرجوعی', value: sales?.returns, minus: true },
                                    { label: 'بهای تمام‌شده', value: sales?.net_cogs, minus: true },
                                    { label: 'سود ناخالص', value: sales?.gross_profit, strong: true },
                                    { label: 'هزینه‌های عملیاتی', value: sales?.expenses, minus: true }
                                ].map((line) => (
                                    <div key={line.label} className='flex items-center justify-between py-2.5'>
                                        <dt className={line.strong ? 'font-semibold text-gray-800 dark:text-white/90' : 'text-gray-500 dark:text-gray-400'}>
                                            {line.label}
                                        </dt>
                                        <dd
                                            className={`tabular-nums ${line.minus && line.value ? 'text-error-600 dark:text-error-400' : 'text-gray-800 dark:text-white/90'} ${line.strong ? 'font-semibold' : ''}`}
                                        >
                                            {line.minus && line.value ? '− ' : ''}
                                            {compactToman(line.value)}
                                        </dd>
                                    </div>
                                ))}
                                <div className='flex items-center justify-between pt-3'>
                                    <dt className='font-bold text-gray-900 dark:text-white'>سود خالص</dt>
                                    <dd className={`text-lg font-bold tabular-nums ${signedClass(sales?.net_profit)}`}>
                                        {compactToman(sales?.net_profit)}
                                    </dd>
                                </div>
                                <div className='grid grid-cols-2 gap-3 pt-4'>
                                    <div className='rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]'>
                                        <p className='text-xs text-gray-400'>حاشیه ناخالص</p>
                                        <p className='mt-1 font-semibold text-gray-800 dark:text-white/90'>
                                            {formatPercent(sales?.gross_margin_percent)}
                                        </p>
                                    </div>
                                    <div className='rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]'>
                                        <p className='text-xs text-gray-400'>حاشیه خالص</p>
                                        <p className='mt-1 font-semibold text-gray-800 dark:text-white/90'>
                                            {formatPercent(sales?.net_margin_percent)}
                                        </p>
                                    </div>
                                </div>
                            </dl>
                        )}
                    </Panel>
                )}
            </div>

            {/* ---------------------------- cash flow ---------------------------- */}
            {show(cash) && (
                <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
                    <Panel className='xl:col-span-2' title='دریافت و پرداخت روزانه' subtitle='ورود و خروج وجه صندوق' href={ROUTES.CashReport}>
                        {isLoading ? (
                            <Skeleton className='h-64' />
                        ) : cashDays.every((row) => !row.total_in && !row.total_out) ? (
                            <Empty text='در این بازه تراکنشی در صندوق ثبت نشده است.' />
                        ) : (
                            <div dir='ltr'>
                                <Chart
                                    type='bar'
                                    height={260}
                                    options={{
                                        ...baseChart,
                                        colors: ['#12b76a', '#f04438'],
                                        plotOptions: { bar: { columnWidth: '45%', borderRadius: 4, borderRadiusApplication: 'end' } },
                                        xaxis: xaxis(cashDays.map((row) => shortDay(row.day)))
                                    }}
                                    series={[
                                        { name: 'دریافتی', data: cashDays.map((row) => row.total_in) },
                                        { name: 'پرداختی', data: cashDays.map((row) => row.total_out) }
                                    ]}
                                />
                            </div>
                        )}
                    </Panel>

                    <Panel title='دریافتی به تفکیک روش پرداخت'>
                        {isLoading ? (
                            <Skeleton className='h-64' />
                        ) : cashMethods.length === 0 ? (
                            <Empty text='دریافتی ثبت نشده است.' />
                        ) : (
                            <div dir='ltr'>
                                <Chart
                                    type='donut'
                                    height={270}
                                    options={{
                                        chart: { fontFamily: 'inherit' },
                                        labels: cashMethods.map((row) => paymentMethodLabel(row.method)),
                                        colors: ['#465fff', '#12b76a', '#f79009', '#0ba5ec', '#7a5af8', '#98a2b3'],
                                        legend: { position: 'bottom', labels: { colors: '#98a2b3' } },
                                        dataLabels: { enabled: false },
                                        stroke: { width: 0 },
                                        tooltip: { y: { formatter: (value: number) => formatToman(value) } },
                                        plotOptions: {
                                            pie: {
                                                donut: {
                                                    size: '70%',
                                                    labels: {
                                                        show: true,
                                                        total: { show: true, label: 'جمع دریافتی', formatter: () => compactToman(cash?.total_in) },
                                                        value: { formatter: (value: string) => compactToman(Number(value)) }
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    series={cashMethods.map((row) => row.total_in)}
                                />
                            </div>
                        )}
                    </Panel>
                </div>
            )}

            {/* ------------------------- rankings & lists ------------------------- */}
            <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                {show(overview?.top_products) && (
                    <Panel title='پرسودترین محصولات' subtitle='بر اساس سود ناخالص' href={ROUTES.ProfitReport}>
                        {isLoading ? (
                            <Skeleton className='h-56' />
                        ) : products.length === 0 ? (
                            <Empty text='در این بازه فروشی ثبت نشده است.' />
                        ) : (
                            <ul className='space-y-4'>
                                {products.map((row) => (
                                    <BarRow
                                        key={row.product_id}
                                        label={row.product_name || 'محصول بدون نام'}
                                        value={compactToman(row.gross_profit)}
                                        ratio={Math.max(row.gross_profit, 0) / maxProductProfit}
                                        color='bg-success-500'
                                        hint={`${formatNumber(row.units_sold)} واحد · فروش ${compactToman(row.revenue)}`}
                                    />
                                ))}
                            </ul>
                        )}
                    </Panel>
                )}

                {show(overview?.orders_by_status) && (
                    <Panel title='وضعیت سفارش‌ها' subtitle={`${formatNumber(statusTotal)} سفارش در بازه`} href={ROUTES.Orders}>
                        {isLoading ? (
                            <Skeleton className='h-56' />
                        ) : statuses.length === 0 ? (
                            <Empty text='در این بازه سفارشی ثبت نشده است.' />
                        ) : (
                            <>
                                <div className='mb-5 flex h-3 gap-0.5 overflow-hidden rounded-full'>
                                    {statuses.map((row) => (
                                        <div
                                            key={row.status}
                                            className={ORDER_STATUS[row.status]?.bar ?? 'bg-gray-400'}
                                            style={{ width: `${(row.count / statusTotal) * 100}%` }}
                                            title={`${ORDER_STATUS[row.status]?.label ?? row.status}: ${formatNumber(row.count)}`}
                                        />
                                    ))}
                                </div>
                                <ul className='space-y-3 text-sm'>
                                    {statuses.map((row) => (
                                        <li key={row.status} className='flex items-center gap-2'>
                                            <span className={`h-2.5 w-2.5 rounded-full ${ORDER_STATUS[row.status]?.bar ?? 'bg-gray-400'}`} />
                                            <span className='flex-1 text-gray-600 dark:text-gray-300'>{ORDER_STATUS[row.status]?.label ?? row.status}</span>
                                            <span className='font-medium text-gray-900 tabular-nums dark:text-white'>{formatNumber(row.count)}</span>
                                            <span className='w-12 text-end text-xs text-gray-400'>{formatPercent((row.count / statusTotal) * 100)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Panel>
                )}

                {show(overview?.expense_breakdown) && (
                    <Panel title='هزینه‌ها' subtitle={`جمع: ${formatToman(sales?.expenses)}`} href={ROUTES.Expenses}>
                        {isLoading ? (
                            <Skeleton className='h-56' />
                        ) : expenses.length === 0 ? (
                            <Empty text='هزینه‌ای در این بازه ثبت نشده است.' />
                        ) : (
                            <ul className='space-y-4'>
                                {expenses.map((row) => (
                                    <BarRow
                                        key={row.category}
                                        label={EXPENSE_CATEGORY_CONFIG[row.category]?.label ?? row.category}
                                        value={compactToman(row.amount)}
                                        ratio={row.amount / (expenses[0].amount || 1)}
                                        color='bg-error-400'
                                        hint={`${formatNumber(row.count)} مورد`}
                                    />
                                ))}
                            </ul>
                        )}
                    </Panel>
                )}
            </div>

            <div className='grid grid-cols-1 items-start gap-6 xl:grid-cols-3'>
                {show(overview?.recent_orders) && (
                    <Panel className='xl:col-span-2' title='آخرین سفارش‌ها' subtitle='۵ سفارش اخیر' href={ROUTES.Orders}>
                        {isLoading ? (
                            <Skeleton className='h-56' />
                        ) : (overview?.recent_orders ?? []).length === 0 ? (
                            <Empty text='سفارشی ثبت نشده است.' />
                        ) : (
                            <div className='-mx-5 overflow-x-auto'>
                                <table className='w-full min-w-[520px] text-sm'>
                                    <thead>
                                        <tr className='text-xs text-gray-400'>
                                            <th className='px-5 pb-2 text-start font-normal'>مشتری</th>
                                            <th className='px-5 pb-2 text-start font-normal'>تاریخ</th>
                                            <th className='px-5 pb-2 text-start font-normal'>مبلغ</th>
                                            <th className='px-5 pb-2 text-start font-normal'>وضعیت</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                                        {(overview?.recent_orders ?? []).map((order) => {
                                            const status = ORDER_STATUS[order.status] ?? { label: order.status, color: 'light' as BadgeColor };
                                            return (
                                                <tr key={order.id}>
                                                    <td className='px-5 py-3 text-gray-800 dark:text-white/90'>
                                                        {order.user_name || (
                                                            <span dir='ltr' className='tabular-nums'>
                                                                {order.user_phone_number || '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='px-5 py-3 text-gray-500'>{new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                                                    <td className='px-5 py-3 text-gray-800 tabular-nums dark:text-white/90'>{formatToman(order.final_amount)}</td>
                                                    <td className='px-5 py-3'>
                                                        <Badge color={status.color}>{status.label}</Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Panel>
                )}

                {show(inventory) && (
                    <Panel
                        title='کالاهای رو به اتمام'
                        subtitle={`موجودی ${formatNumber(inventory?.low_stock_threshold)} عدد یا کمتر`}
                        href={ROUTES.InventoryStock}
                    >
                        {isLoading ? (
                            <Skeleton className='h-56' />
                        ) : (
                            <>
                                <div className='mb-4 grid grid-cols-2 gap-3'>
                                    <div className='bg-warning-50 dark:bg-warning-500/10 rounded-xl p-3'>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>رو به اتمام</p>
                                        <p className='text-warning-600 dark:text-warning-400 mt-1 text-lg font-bold tabular-nums'>
                                            {formatNumber(inventory?.low_stock_count)}
                                        </p>
                                    </div>
                                    <div className='bg-error-50 dark:bg-error-500/10 rounded-xl p-3'>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>ناموجود</p>
                                        <p className='text-error-600 dark:text-error-400 mt-1 text-lg font-bold tabular-nums'>
                                            {formatNumber(inventory?.out_of_stock_count)}
                                        </p>
                                    </div>
                                </div>
                                {(inventory?.low_stock ?? []).length === 0 ? (
                                    <Empty text='موجودی همه‌ی کالاها کافی است.' />
                                ) : (
                                    <ul className='divide-y divide-gray-100 dark:divide-gray-800'>
                                        {(inventory?.low_stock ?? []).map((row) => (
                                            <li key={row.variant_id} className='flex items-center gap-3 py-2.5'>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='truncate text-sm font-medium text-gray-800 dark:text-white/90'>
                                                        {row.product_name || 'محصول بدون نام'}
                                                    </p>
                                                    {row.attributes?.length > 0 && (
                                                        <div className='mt-0.5 flex items-center gap-1.5 text-xs text-gray-400'>
                                                            {row.attributes.map((attr) =>
                                                                /^#[0-9a-f]{3,8}$/i.test(attr.value) ? (
                                                                    <span
                                                                        key={attr.key}
                                                                        title={attr.label || attr.value}
                                                                        className='h-3.5 w-3.5 rounded-full ring-1 ring-gray-200 dark:ring-gray-700'
                                                                        style={{ backgroundColor: attr.value }}
                                                                    />
                                                                ) : (
                                                                    <span key={attr.key} className='truncate'>
                                                                        {describeAttributes([attr])}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className='text-warning-600 shrink-0 text-sm font-semibold tabular-nums'>
                                                    {formatNumber(row.quantity)} عدد
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </Panel>
                )}
            </div>
        </div>
    );
};

export default OverviewDashboard;
