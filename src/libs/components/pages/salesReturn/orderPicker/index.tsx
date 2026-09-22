'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import Pagination from 'libs/components/common/Pagination';
import { formatDateTime, formatToman } from 'libs/constants/warehouse/warehouse.constants';
import { Button, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import useSWR from 'swr';

/** آیتم سفارش از `/order/all` با کلیدهای PascalCase برمی‌گردد. */
export interface IPickerOrderItem {
    ProductID: string;
    VariantID: string;
    Quantity: number;
    ProductName: string;
    VariantAttributes?: { key: string; value: string; label: string }[];
    PriceAtTime: number;
    DiscountAmount?: number;
    IsCustom?: boolean;
}

export interface IPickerOrder {
    id: string;
    status: string;
    user_id: string;
    user_name: string;
    user_phone_number: string;
    items: IPickerOrderItem[];
    final_amount: number;
    created_at: string;
}

const PAGE_SIZE = 10;

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (order: IPickerOrder) => void;
}

const OrderPicker = ({ isOpen, onClose, onSelect }: IProps) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useSWR([ApiKeys.GET_ALL_ORDER(page, PAGE_SIZE)], ([url]: [string]) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const orders: IPickerOrder[] = data?.data?.orders ?? [];

    // اندپوینت سفارش‌ها فیلتر جست‌وجو ندارد، پس صفحه‌ی جاری سمت کلاینت فیلتر می‌شود.
    const term = search.trim();
    const filtered = term
        ? orders.filter((order) =>
              [order.id, order.user_name, order.user_phone_number].some((field) => (field ?? '').includes(term))
          )
        : orders;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[820px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>انتخاب سفارش</h3>
            <p className='mt-1 text-xs text-gray-400'>سفارشی که کالای آن برگشت خورده را انتخاب کنید.</p>

            <div className='my-4'>
                <Input
                    name='search'
                    value={search}
                    placeholder='جست‌وجو در این صفحه (شماره سفارش، نام یا موبایل)...'
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className='max-h-[50vh] space-y-2 overflow-y-auto'>
                {isLoading && <p className='py-10 text-center text-sm text-gray-400'>در حال بارگذاری...</p>}

                {!isLoading && filtered.length === 0 && (
                    <p className='py-10 text-center text-sm text-gray-400'>سفارشی یافت نشد.</p>
                )}

                {filtered.map((order) => (
                    <div
                        key={order.id}
                        className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800'
                    >
                        <div className='space-y-1'>
                            <p className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                {order.user_name || 'بدون نام'}{' '}
                                <span dir='ltr' className='font-mono text-xs text-gray-400'>
                                    {order.user_phone_number}
                                </span>
                            </p>
                            <p className='text-xs text-gray-400'>
                                {formatDateTime(order.created_at)} · {order.items?.length ?? 0} قلم ·{' '}
                                {formatToman(order.final_amount)}
                            </p>
                        </div>
                        <Button size='sm' variant='outline' onClick={() => onSelect(order)}>
                            انتخاب
                        </Button>
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            <div className='mt-4 flex justify-end'>
                <Button variant='outline' size='sm' onClick={onClose} type='button'>
                    بستن
                </Button>
            </div>
        </Modal>
    );
};

export default OrderPicker;
