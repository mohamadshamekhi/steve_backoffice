'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { IPartnerShopOrder } from 'libs/models/partnerShop.model';
import { Badge, EmptyState } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';
import { formatShopDate, formatToman, getOrderStatusConfig } from '../constants';

const MyOrders = () => {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading } = useSWR(
        [ApiKeys.PARTNER_SHOP_MY_ORDERS, page, limit],
        ([url, pageNum, pageSize]: [string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', { params: { page_number: pageNum, page_size: pageSize } })
    );

    const orders: IPartnerShopOrder[] = data?.data?.orders ?? [];

    return (
        <ContentWrapper title='سفارش‌های من'>
            {isLoading ? (
                <div className='flex min-h-[200px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            ) : orders.length === 0 ? (
                <EmptyState title='هنوز سفارشی ثبت نکرده‌اید' />
            ) : (
                <div className='space-y-4'>
                    {orders.map((order) => {
                        const config = getOrderStatusConfig(order.status);
                        return (
                            <div
                                key={order._id}
                                className='rounded-xl border border-gray-200 p-4 dark:border-gray-800'
                            >
                                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                                    <div className='flex items-center gap-2'>
                                        <Badge color={config.color}>{config.label}</Badge>
                                        <span className='text-xs text-gray-400'>
                                            {formatShopDate(order.created_at)}
                                        </span>
                                    </div>
                                    <span className='font-semibold text-gray-900 dark:text-white'>
                                        {formatToman(order.final_amount)}
                                    </span>
                                </div>
                                <div className='space-y-1.5'>
                                    {order.items.map((item, i) => (
                                        <div
                                            key={`${order._id}-${i}`}
                                            className='flex justify-between text-sm text-gray-600 dark:text-gray-300'
                                        >
                                            <span>
                                                {item.ProductName} × {item.Quantity}
                                            </span>
                                            <span>{formatToman(item.PriceAtTime)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

export default MyOrders;
