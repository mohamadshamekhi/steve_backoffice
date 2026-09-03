'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IPartnerShopCartItem, IPartnerShopProduct, IPartnerShopVariant } from 'libs/models/partnerShop.model';
import { Badge, Button, EmptyState, Input } from 'libs/ui';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';
import { formatToman, PARTNER_SHOP_ORDER } from '../constants';
import { usePartnerCart } from '../usePartnerCart';

interface ProductCardProps {
    product: IPartnerShopProduct;
    canOrder: boolean;
    productCartItems: IPartnerShopCartItem[];
    busy: boolean;
    onSetQuantity: (productId: string, variantId: string, quantity: number) => void;
}

const QtyStepper = ({
    value,
    max,
    disabled,
    onChange
}: {
    value: number;
    max: number;
    disabled: boolean;
    onChange: (next: number) => void;
}) => (
    <div className='flex flex-1 items-center justify-between rounded-lg border border-brand-500 px-1'>
        <button
            type='button'
            disabled={disabled}
            onClick={() => onChange(value - 1)}
            className='flex h-9 w-9 items-center justify-center text-lg text-brand-500 disabled:opacity-40'
        >
            −
        </button>
        <span className='min-w-8 text-center text-sm font-semibold'>{value}</span>
        <button
            type='button'
            disabled={disabled || value >= max}
            onClick={() => onChange(value + 1)}
            className='flex h-9 w-9 items-center justify-center text-lg text-brand-500 disabled:opacity-40'
        >
            +
        </button>
    </div>
);

const ProductCard = ({ product, canOrder, productCartItems, busy, onSetQuantity }: ProductCardProps) => {
    const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
    const [quantity, setQuantity] = useState(1);

    const variant: IPartnerShopVariant | undefined =
        product.variants.find((v) => v.id === variantId) ?? product.variants[0];

    const outOfStock = !variant || variant.quantity <= 0;
    // A product can have several variants; show the stepper only for the one
    // currently selected that is already in the cart.
    const activeCartItem = variant
        ? productCartItems.find((item) => item.variant_id === variant.id)
        : undefined;

    const handleAdd = () => {
        if (!variant) return;
        const qty = Math.max(1, Math.min(quantity, variant.quantity));
        onSetQuantity(product.id, variant.id, qty);
        toast.success('به سبد خرید اضافه شد');
    };

    return (
        <div className='flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
            <div className='relative aspect-square bg-gray-50 dark:bg-gray-900'>
                <Image
                    src={product.url || noPic}
                    alt={product.name}
                    fill
                    className='object-contain p-4'
                    sizes='(max-width: 768px) 50vw, 25vw'
                />
                {product.partner_eligible && product.applied_percent > 0 && (
                    <span className='bg-error-500 absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-semibold text-white'>
                        {product.applied_percent}%−
                    </span>
                )}
            </div>

            <div className='flex flex-1 flex-col gap-3 p-4'>
                <h3 className='line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-800 dark:text-white/90'>
                    {product.name}
                </h3>

                {product.variants.length > 1 && (
                    <select
                        value={variantId}
                        onChange={(e) => setVariantId(e.target.value)}
                        className='w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90'
                    >
                        {product.variants.map((v, i) => (
                            <option key={v.id} value={v.id}>
                                تنوع {i + 1} · {v.warranty || 'بدون گارانتی'} ·{' '}
                                {v.quantity > 0 ? `${v.quantity} عدد` : 'ناموجود'}
                            </option>
                        ))}
                    </select>
                )}

                {variant && (
                    <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                            <span className='text-base font-bold text-gray-900 dark:text-white'>
                                {formatToman(variant.partner_price)}
                            </span>
                            {variant.discount_amount > 0 && (
                                <span className='text-xs text-gray-400 line-through'>
                                    {formatToman(variant.price)}
                                </span>
                            )}
                        </div>
                        <p className='text-xs text-gray-400'>
                            {variant.warranty || 'بدون گارانتی'} ·{' '}
                            {variant.quantity > 0 ? `موجودی: ${variant.quantity}` : 'ناموجود'}
                        </p>
                    </div>
                )}

                {!product.partner_eligible && (
                    <Badge color='light' size='sm'>
                        بدون تخفیف همکاری
                    </Badge>
                )}

                <div className='mt-auto flex items-center gap-2'>
                    {activeCartItem ? (
                        <QtyStepper
                            value={activeCartItem.quantity}
                            max={variant?.quantity ?? activeCartItem.quantity}
                            disabled={busy || !canOrder}
                            onChange={(next) =>
                                onSetQuantity(product.id, activeCartItem.variant_id, next)
                            }
                        />
                    ) : (
                        <>
                            <Input
                                type='number'
                                min='1'
                                max={String(variant?.quantity ?? 1)}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className='h-9 w-16 px-2 text-center'
                                disabled={outOfStock || !canOrder}
                            />
                            <Button
                                size='sm'
                                className='flex-1'
                                onClick={handleAdd}
                                loading={busy}
                                disabled={outOfStock || !canOrder || busy}
                            >
                                {outOfStock ? 'ناموجود' : 'افزودن به سبد'}
                            </Button>
                        </>
                    )}
                </div>
                {!canOrder && <p className='text-xs text-gray-400'>برای ثبت سفارش دسترسی لازم را ندارید.</p>}
            </div>
        </div>
    );
};

const Catalog = () => {
    const hasOrderPermission = usePermission(PARTNER_SHOP_ORDER);
    const isPartner = useRole('partner');
    const canOrder = hasOrderPermission || isPartner;

    const { findItem, setItem, pendingKey } = usePartnerCart();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 24;

    const { data, isLoading } = useSWR(
        [ApiKeys.PARTNER_SHOP_PRODUCTS, page, limit, search],
        ([url, pageNum, pageSize, name]: [string, number, number, string]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: pageSize, ...(name && { name }) }
            })
    );

    const products: IPartnerShopProduct[] = data?.data?.products ?? [];

    return (
        <ContentWrapper title='لیست محصولات همکاری'>
            <div className='mb-4'>
                <Input
                    type='text'
                    placeholder='جستجو بر اساس نام محصول...'
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className='max-w-md'
                />
            </div>

            {isLoading ? (
                <div className='flex min-h-[240px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            ) : products.length === 0 ? (
                <EmptyState title='محصولی یافت نشد' subtitle='با تغییر عبارت جستجو دوباره تلاش کنید.' />
            ) : (
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
                    {products.map((product) => {
                        const productCartItems = product.variants
                            .map((v) => findItem(product.id, v.id))
                            .filter((item): item is NonNullable<typeof item> => Boolean(item));
                        const busy = !!pendingKey && pendingKey.startsWith(`${product.id}:`);
                        return (
                            <ProductCard
                                key={product.id}
                                product={product}
                                canOrder={canOrder}
                                productCartItems={productCartItems}
                                busy={busy}
                                onSetQuantity={setItem}
                            />
                        );
                    })}
                </div>
            )}

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </ContentWrapper>
    );
};

export default Catalog;
