'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ProductVariantPicker from 'libs/components/common/productVariantPicker';
import SupplierSelect from 'libs/components/pages/supplier/select';
import ROUTES from 'libs/constants/routes/routes.constants';
import {
    DEFAULT_PAGE_SIZE,
    describeAttributes,
    formatDateTime,
    formatNumber,
    formatSigned,
    formatToman,
    MOVEMENT_TYPE_CONFIG,
    MOVEMENT_TYPE_OPTIONS,
    REF_TYPE_OPTIONS,
    signedClass,
    toIsoDate
} from 'libs/constants/warehouse/warehouse.constants';
import { IInventoryMovement } from 'libs/models/warehouse.model';
import { Badge, Button, CSelect, DatePicker, Link, Table } from 'libs/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import useSWR from 'swr';

const RelatedLink = ({ movement }: { movement: IInventoryMovement }) => {
    if (!movement.ref_id || !movement.ref_type || movement.ref_type === 'manual') {
        return <span className='text-xs text-gray-400'>-</span>;
    }

    const href =
        movement.ref_type === 'purchase'
            ? ROUTES.PurchaseDetail(movement.ref_id)
            : movement.ref_type === 'stocktake'
              ? ROUTES.StocktakeMovements(movement.ref_id)
              : `${ROUTES.Orders}?id=${movement.ref_id}`;
    const label = { purchase: 'فاکتور خرید', stocktake: 'انبارگردانی', order: 'سفارش' }[movement.ref_type];

    return (
        <Link href={href} className='text-brand-500 text-nowrap text-sm'>
            {label}
        </Link>
    );
};

const InventoryMovements = () => {
    const [page, setPage] = useState(1);
    const [productId, setProductId] = useState('');
    const [variantId, setVariantId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [type, setType] = useState('');
    const searchParams = useSearchParams();
    const [refType, setRefType] = useState(searchParams.get('ref_type') ?? '');
    const [refId, setRefId] = useState(searchParams.get('ref_id') ?? '');
    const [from, setFrom] = useState<DateObject | null>(null);
    const [to, setTo] = useState<DateObject | null>(null);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_INVENTORY_MOVEMENTS, page, productId, variantId, supplierId, type, refType, refId, fromDate, toDate],
        ([url, pageNum, product, variant, supplier, typeValue, refTypeValue, refIdValue, fromValue, toValue]: [
            string,
            string,
            number,
            string,
            string,
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
                    ...(product && { product_id: product }),
                    ...(variant && { variant_id: variant }),
                    ...(supplier && { supplier_id: supplier }),
                    ...(typeValue && { type: typeValue }),
                    ...(refTypeValue && { ref_type: refTypeValue }),
                    ...(refTypeValue && refIdValue && { ref_id: refIdValue }),
                    ...(fromValue && { from: fromValue }),
                    ...(toValue && { to: toValue })
                }
            })
    );

    const columns: ColumnDef<IInventoryMovement>[] = [
        {
            accessorKey: 'created_at',
            header: 'تاریخ',
            cell: ({ row }) => formatDateTime(row.original.created_at)
        },
        {
            accessorKey: 'type',
            header: 'نوع حرکت',
            cell: ({ row }) => {
                const config = MOVEMENT_TYPE_CONFIG[row.original.type];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? row.original.type}</Badge>;
            }
        },
        {
            accessorKey: 'product_name',
            header: 'محصول',
            cell: ({ row }) => (
                <div className='flex flex-col gap-0.5'>
                    <span className='font-medium'>{row.original.product_name}</span>
                    <span className='text-xs text-gray-500'>
                        {describeAttributes(row.original.variant_attributes)}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'quantity',
            header: 'تعداد',
            cell: ({ row }) => (
                <span className={signedClass(row.original.quantity)}>{formatSigned(row.original.quantity)}</span>
            )
        },
        {
            accessorKey: 'total_cost',
            header: 'قیمت تمام‌شده',
            cell: ({ row }) => formatToman(row.original.total_cost)
        },
        {
            accessorKey: 'total_price',
            header: 'مبلغ فروش',
            cell: ({ row }) => formatToman(row.original.total_price)
        },
        {
            accessorKey: 'profit',
            header: 'سود',
            cell: ({ row }) => (
                <span className={signedClass(row.original.profit)}>{formatToman(row.original.profit)}</span>
            )
        },
        {
            accessorKey: 'quantity_after',
            header: 'موجودی پس از حرکت',
            cell: ({ row }) => formatNumber(row.original.quantity_after)
        },
        {
            accessorKey: 'avg_cost_after',
            header: 'میانگین خرید پس از حرکت',
            cell: ({ row }) => formatToman(row.original.avg_cost_after)
        },
        {
            id: 'ref',
            header: 'مرجع',
            enableSorting: false,
            cell: ({ row }) => <RelatedLink movement={row.original} />
        },
        {
            accessorKey: 'note',
            header: 'یادداشت',
            cell: ({ row }) => row.original.note || '-'
        }
    ];

    return (
        <ContentWrapper
            title='دفتر حرکت کالا'
            extra={
                refId ? (
                    <Button size='sm' variant='outline' onClick={() => setRefId('')}>
                        حذف فیلتر مرجع ({refId.slice(-6)})
                    </Button>
                ) : undefined
            }
        >
            <div className='mb-4 grid grid-cols-1 gap-3 md:grid-cols-3'>
                <div className='md:col-span-2'>
                    <label className='mb-1 block text-xs text-gray-400'>محصول و واریانت</label>
                    <ProductVariantPicker
                        productId={productId}
                        variantId={variantId}
                        onChange={({ product_id, variant_id }) => {
                            setProductId(product_id);
                            setVariantId(variant_id);
                            setPage(1);
                        }}
                    />
                </div>
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
                    <label className='mb-1 block text-xs text-gray-400'>نوع حرکت</label>
                    <CSelect
                        name='type'
                        options={[{ value: '', label: 'همه' }, ...MOVEMENT_TYPE_OPTIONS]}
                        value={type}
                        onChange={(value) => {
                            setType(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>نوع مرجع</label>
                    <CSelect
                        name='ref_type'
                        options={[{ value: '', label: 'همه' }, ...REF_TYPE_OPTIONS]}
                        value={refType}
                        onChange={(value) => {
                            setRefType(value);
                            setRefId('');
                            setPage(1);
                        }}
                    />
                </div>
                <div className='grid grid-cols-2 gap-2'>
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
            </div>

            <Table<IInventoryMovement>
                headerClass='text-nowrap'
                columns={columns}
                data={data?.data?.movements ?? []}
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

export default InventoryMovements;
