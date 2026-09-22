'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import {
    DEFAULT_PAGE_SIZE,
    describeAttributes,
    formatNumber,
    formatToman,
    INVENTORY_ADJUST,
    INVENTORY_UPDATE_STOCK_CONFIG,
    signedClass,
    STOCK_MODE_CONFIG
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IStockRow } from 'libs/models/warehouse.model';
import ROUTES from 'libs/constants/routes/routes.constants';
import { Badge, Button, CSelect, Input, Link, Switch, Table } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';
import { ExportButton } from 'libs/components/pages/report/shared';
import AdjustModal from '../adjustModal';
import BackfillSalesModal from '../backfillSalesModal';
import StockConfigModal from '../stockConfigModal';

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className='mt-1 text-xl font-bold text-gray-900 dark:text-white'>{value}</p>
    </div>
);

type StockFilter = '' | 'low' | 'out';

const STOCK_FILTER_OPTIONS: { value: StockFilter; label: string }[] = [
    { value: '', label: 'همه‌ی کالاها' },
    { value: 'low', label: 'رو به اتمام' },
    { value: 'out', label: 'ناموجود' }
];

const stockFilterParams = (filter: StockFilter, threshold: string, includeSecondHand: boolean) => ({
    ...(filter === 'low' && { low_stock: true, threshold: Number(threshold) || 3 }),
    ...(filter === 'out' && { out_of_stock: true }),
    ...(filter && includeSecondHand && { include_second_hand: true })
});

const InventoryStock = () => {
    const canAdjust = usePermission(INVENTORY_ADJUST);
    const canConfigure = usePermission(INVENTORY_UPDATE_STOCK_CONFIG);

    const [page, setPage] = useState(1);
    const [stockFilter, setStockFilter] = useState<StockFilter>('');
    const [threshold, setThreshold] = useState('3');
    const [includeSecondHand, setIncludeSecondHand] = useState(false);
    const [backfillOpen, setBackfillOpen] = useState(false);

    const filterParams = stockFilterParams(stockFilter, threshold, includeSecondHand);

    const [adjustTarget, setAdjustTarget] = useState<IStockRow | null>(null);
    const [configTarget, setConfigTarget] = useState<IStockRow | null>(null);

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_INVENTORY_STOCK, page, stockFilter, threshold, includeSecondHand],
        ([url, pageNum]: [string, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: {
                    page_number: pageNum,
                    page_size: DEFAULT_PAGE_SIZE,
                    ...filterParams
                }
            })
    );

    const columns: ColumnDef<IStockRow>[] = [
        { accessorKey: 'product_name', header: 'محصول' },
        {
            id: 'attributes',
            header: 'واریانت',
            cell: ({ row }) => describeAttributes(row.original.attributes) || '-'
        },
        {
            accessorKey: 'stock_mode',
            header: 'حالت موجودی',
            cell: ({ row }) => {
                const config = STOCK_MODE_CONFIG[row.original.stock_mode];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.stock_mode}</Badge>;
            }
        },
        {
            accessorKey: 'quantity',
            header: 'موجودی',
            cell: ({ row }) => (
                <span className={signedClass(row.original.quantity)}>{formatNumber(row.original.quantity)}</span>
            )
        },
        {
            accessorKey: 'avg_cost',
            header: 'میانگین قیمت خرید',
            cell: ({ row }) => formatToman(row.original.avg_cost)
        },
        {
            accessorKey: 'price',
            header: 'قیمت فروش',
            cell: ({ row }) => formatToman(row.original.price)
        },
        {
            accessorKey: 'stock_value',
            header: 'ارزش انبار',
            cell: ({ row }) => formatToman(row.original.stock_value)
        },
        {
            accessorKey: 'potential_profit',
            header: 'سود بالقوه',
            cell: ({ row }) => (
                <span className={signedClass(row.original.potential_profit)}>
                    {formatToman(row.original.potential_profit)}
                </span>
            )
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
                        disabled={!canAdjust}
                        onClick={() => setAdjustTarget(row.original)}
                    >
                        انبارگردانی
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='text-nowrap'
                        disabled={!canConfigure}
                        onClick={() => setConfigTarget(row.original)}
                    >
                        تنظیم موجودی
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <StatCard label='ارزش کل انبار' value={formatToman(data?.data?.total_stock_value ?? 0)} />
                <StatCard label='تعداد کل واحدها' value={formatNumber(data?.data?.total_units ?? 0)} />
            </div>

            <ContentWrapper
                title='موجودی انبار'
                extra={
                    <div className='flex flex-wrap items-center gap-2'>
                        <ExportButton
                            path={ApiKeys.GET_INVENTORY_STOCK}
                            params={filterParams}
                            fileName='inventory-stock'
                        />
                        <Link href={ROUTES.InventoryStocktake}>
                            <Button size='sm' variant='outline'>
                                انبارگردانی گروهی
                            </Button>
                        </Link>
                        {canAdjust && (
                            <Button size='sm' variant='outline' onClick={() => setBackfillOpen(true)}>
                                ثبت فروش‌های قدیمی
                            </Button>
                        )}
                        {canAdjust && (
                            <Button size='sm' onClick={() => setAdjustTarget({} as IStockRow)}>
                                اصلاح موجودی
                            </Button>
                        )}
                    </div>
                }
            >
                <div className='mb-4 flex flex-wrap items-end gap-4'>
                    <div className='w-full md:w-44'>
                        <label className='mb-1 block text-xs text-gray-400'>وضعیت موجودی</label>
                        <CSelect
                            name='stock_filter'
                            options={STOCK_FILTER_OPTIONS}
                            value={stockFilter}
                            onChange={(value: string) => {
                                setStockFilter(value as StockFilter);
                                setPage(1);
                            }}
                        />
                    </div>

                    {stockFilter === 'low' && (
                        <div className='w-32'>
                            <label className='mb-1 block text-xs text-gray-400'>آستانه</label>
                            <Input
                                name='threshold'
                                type='number'
                                min='0'
                                inputMode='numeric'
                                value={threshold}
                                onChange={(e) => {
                                    setThreshold(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    )}

                    {stockFilter && (
                        <div className='flex items-center gap-2 pb-2'>
                            <Switch
                                name='include_second_hand'
                                checked={includeSecondHand}
                                onChange={(checked) => {
                                    setIncludeSecondHand(checked);
                                    setPage(1);
                                }}
                                size='md'
                                variant='primary'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>شامل کالای دست‌دوم</span>
                        </div>
                    )}
                </div>

                <Table<IStockRow>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.rows ?? []}
                    loading={isLoading}
                />

                <Pagination
                    currentPage={page}
                    total={data?.data?.pagination?.total ?? 0}
                    pageSize={DEFAULT_PAGE_SIZE}
                    onPageChange={setPage}
                />
            </ContentWrapper>

            {adjustTarget && (
                <AdjustModal
                    isOpen={Boolean(adjustTarget)}
                    onClose={() => setAdjustTarget(null)}
                    mutate={mutate}
                    target={
                        adjustTarget.variant_id
                            ? {
                                  product_id: adjustTarget.product_id,
                                  variant_id: adjustTarget.variant_id,
                                  product_name: adjustTarget.product_name
                              }
                            : null
                    }
                />
            )}

            {backfillOpen && <BackfillSalesModal isOpen={backfillOpen} onClose={() => setBackfillOpen(false)} />}

            {configTarget && (
                <StockConfigModal
                    isOpen={Boolean(configTarget)}
                    onClose={() => setConfigTarget(null)}
                    mutate={mutate}
                    productId={configTarget.product_id}
                    variantId={configTarget.variant_id}
                    productName={configTarget.product_name}
                />
            )}
        </div>
    );
};

export default InventoryStock;
