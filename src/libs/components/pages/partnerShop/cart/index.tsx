'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ROUTES from 'libs/constants/routes/routes.constants';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IPartnerShopCart, PartnerShopPaymentMethod } from 'libs/models/partnerShop.model';
import { Badge, Button, EmptyState } from 'libs/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';
import { formatToman, PARTNER_SHOP_ORDER, PARTNER_TXN_STORAGE_KEY } from '../constants';

const isFetchError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

const EMPTY_CART: IPartnerShopCart = { cart_id: '', subtotal: 0, saved_total: 0, items: [] };

const Cart = () => {
    const router = useRouter();
    const hasOrderPermission = usePermission(PARTNER_SHOP_ORDER);
    const isPartner = useRole('partner');
    const canOrder = hasOrderPermission || isPartner;

    const { data, isLoading, mutate } = useSWR(ApiKeys.PARTNER_SHOP_CART, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const [pendingKey, setPendingKey] = useState<string | null>(null);
    const [checkoutMethod, setCheckoutMethod] = useState<PartnerShopPaymentMethod | null>(null);

    const cart: IPartnerShopCart = data?.data ?? EMPTY_CART;
    const hasStockIssue = cart.items.some((item) => !item.in_stock);
    const isEmpty = cart.items.length === 0;

    const setItemQuantity = async (productId: string, variantId: string, quantity: number) => {
        const key = `${productId}:${variantId}`;
        setPendingKey(key);
        try {
            const res =
                quantity <= 0
                    ? await fetcher(ApiKeys.PARTNER_SHOP_CART_ITEMS, 'dashboard', 'DELETE', {
                          body: { product_id: productId, variant_id: variantId }
                      })
                    : await fetcher(ApiKeys.PARTNER_SHOP_CART_ITEMS, 'dashboard', 'POST', {
                          body: { product_id: productId, variant_id: variantId, quantity }
                      });
            if (isFetchError(res)) return;
            mutate(res, { revalidate: false });
        } finally {
            setPendingKey(null);
        }
    };

    const handleCheckout = async (payment_method: PartnerShopPaymentMethod) => {
        setCheckoutMethod(payment_method);
        try {
            const res = await fetcher(ApiKeys.PARTNER_SHOP_CHECKOUT, 'dashboard', 'POST', {
                body: { payment_method }
            });
            if (isFetchError(res)) return;
            const payload = res?.data;
            if (payment_method === 'online' && payload?.payment_url) {
                if (payload.gateway_transaction_id) {
                    sessionStorage.setItem(PARTNER_TXN_STORAGE_KEY, payload.gateway_transaction_id);
                }
                window.location.href = payload.payment_url;
                return;
            }
            toast.success('سفارش ثبت شد. برای پرداخت به فروشگاه مراجعه کنید.');
            router.push(ROUTES.PartnerShopMyOrders);
        } finally {
            setCheckoutMethod(null);
        }
    };

    if (isLoading) {
        return (
            <ContentWrapper title='سبد خرید'>
                <div className='flex min-h-[200px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper title='سبد خرید همکاری'>
            {isEmpty ? (
                <EmptyState title='سبد خرید شما خالی است.' subtitle='از کاتالوگ محصولات، کالای موردنظر را اضافه کنید.' />
            ) : (
                <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
                    <div className='space-y-3'>
                        {cart.items.map((item) => {
                            const key = `${item.product_id}:${item.variant_id}`;
                            const busy = pendingKey === key;
                            return (
                                <div
                                    key={key}
                                    className='flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800'
                                >
                                    <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900'>
                                        <Image
                                            src={item.url || noPic}
                                            alt={item.product_name}
                                            fill
                                            className='object-contain p-1'
                                            sizes='80px'
                                        />
                                    </div>
                                    <div className='flex flex-1 flex-col gap-1'>
                                        <div className='flex items-start justify-between gap-2'>
                                            <span className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                                {item.product_name}
                                            </span>
                                            {!item.in_stock && (
                                                <Badge color='error' size='sm'>
                                                    ناموجود
                                                </Badge>
                                            )}
                                        </div>
                                        <div className='flex items-center gap-2 text-sm'>
                                            <span className='font-semibold'>{formatToman(item.unit_price)}</span>
                                            {item.base_price > item.unit_price && (
                                                <span className='text-xs text-gray-400 line-through'>
                                                    {formatToman(item.base_price)}
                                                </span>
                                            )}
                                        </div>
                                        <div className='mt-1 flex items-center justify-between'>
                                            <div className='flex items-center gap-1'>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    disabled={busy || !canOrder}
                                                    onClick={() =>
                                                        setItemQuantity(
                                                            item.product_id,
                                                            item.variant_id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    −
                                                </Button>
                                                <span className='w-8 text-center text-sm'>{item.quantity}</span>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    disabled={busy || !canOrder}
                                                    onClick={() =>
                                                        setItemQuantity(
                                                            item.product_id,
                                                            item.variant_id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-sm font-semibold'>
                                                    {formatToman(item.line_total)}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setItemQuantity(item.product_id, item.variant_id, 0)
                                                    }
                                                    disabled={busy || !canOrder}
                                                    className='text-xs text-red-500 hover:underline disabled:opacity-50'
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className='h-fit space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>جمع سبد</span>
                            <span className='font-medium'>{formatToman(cart.subtotal)}</span>
                        </div>
                        <div className='flex justify-between text-sm text-green-600'>
                            <span>صرفه‌جویی شما</span>
                            <span className='font-medium'>{formatToman(cart.saved_total)}</span>
                        </div>

                        {hasStockIssue && (
                            <p className='rounded-lg bg-error-50 p-2 text-xs text-error-600 dark:bg-error-500/10'>
                                برخی اقلام سبد ناموجود هستند. برای ادامه، آن‌ها را حذف کنید.
                            </p>
                        )}

                        <div className='space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800'>
                            <Button
                                className='w-full'
                                disabled={!canOrder || hasStockIssue || !!checkoutMethod}
                                loading={checkoutMethod === 'online'}
                                onClick={() => handleCheckout('online')}
                            >
                                پرداخت آنلاین
                            </Button>
                            <Button
                                variant='outline'
                                className='w-full'
                                disabled={!canOrder || hasStockIssue || !!checkoutMethod}
                                loading={checkoutMethod === 'in_person'}
                                onClick={() => handleCheckout('in_person')}
                            >
                                پرداخت حضوری
                            </Button>
                            {!canOrder && (
                                <p className='text-xs text-gray-400'>برای ثبت سفارش دسترسی لازم را ندارید.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ContentWrapper>
    );
};

export default Cart;
