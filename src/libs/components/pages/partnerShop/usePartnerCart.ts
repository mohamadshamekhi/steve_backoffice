'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { IPartnerShopCart } from 'libs/models/partnerShop.model';
import { useState } from 'react';
import useSWR from 'swr';

const EMPTY_CART: IPartnerShopCart = { cart_id: '', subtotal: 0, saved_total: 0, items: [] };

const isFetchError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

/**
 * Shared partner-shop cart state. Every consumer reads the same SWR key, so the
 * header mini-cart, the catalog cards and the cart page stay in sync automatically.
 */
export const usePartnerCart = (enabled = true) => {
    const { data, isLoading, mutate } = useSWR(enabled ? ApiKeys.PARTNER_SHOP_CART : null, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const [pendingKey, setPendingKey] = useState<string | null>(null);

    const cart: IPartnerShopCart = data?.data ?? EMPTY_CART;
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const findItem = (productId: string, variantId: string) =>
        cart.items.find((item) => item.product_id === productId && item.variant_id === variantId);

    const setItem = async (productId: string, variantId: string, quantity: number) => {
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
            if (isFetchError(res)) return false;
            mutate(res, { revalidate: false });
            return true;
        } finally {
            setPendingKey(null);
        }
    };

    return { cart, count, isLoading, mutate, findItem, setItem, pendingKey };
};
