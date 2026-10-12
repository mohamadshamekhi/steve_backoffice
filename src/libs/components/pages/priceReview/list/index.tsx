'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IPriceReviewItem, IPriceReviewListResponse } from 'libs/models/priceReview.model';
import { Button, Link, Table } from 'libs/ui';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { formatPriceReviewDate, PRICE_REVIEW_MANAGE, PRICE_REVIEW_VIEW } from '../constants';

const ActionCell = ({
    item,
    canManage,
    onConfirmed
}: {
    item: IPriceReviewItem;
    canManage: boolean;
    onConfirmed: (productId: string) => void;
}) => {
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        setLoading(true);
        try {
            await fetcher(ApiKeys.CONFIRM_PRICE_REVIEW(item.product_id), 'dashboard', 'POST');
            toast.success('قیمت بدون تغییر تایید شد');
            onConfirmed(item.product_id);
        } catch (error) {
            console.error('Failed to confirm price review:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center gap-2'>
            <Button
                size='sm'
                variant='outline'
                className='text-nowrap'
                disabled={!canManage || loading}
                loading={loading}
                onClick={confirm}
            >
                تایید بدون تغییر
            </Button>
            <Link
                href={`/dashboard/product/edit/${item.product_id}`}
                className='bg-brand-500 hover:bg-brand-600 rounded-md px-3 py-1.5 text-xs font-semibold text-nowrap text-white'
            >
                ویرایش قیمت
            </Link>
        </div>
    );
};

const List = () => {
    const canView = usePermission(PRICE_REVIEW_VIEW);
    const canManage = usePermission(PRICE_REVIEW_MANAGE);

    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_PRICE_REVIEW_LIST, page, limit],
        ([url, pageNum, pageSize]: [string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', { params: { page_number: pageNum, page_size: pageSize } })
    );

    const response: IPriceReviewListResponse | undefined = data?.data;

    const handleConfirmed = (productId: string) => {
        // به‌جای رفرش کامل، همان ردیف از کش SWR حذف می‌شود.
        mutate(
            (prev: { data: IPriceReviewListResponse } | undefined) =>
                prev
                    ? {
                          ...prev,
                          data: {
                              ...prev.data,
                              items: prev.data.items.filter((i) => i.product_id !== productId),
                              total: Math.max(0, (prev.data.total ?? 1) - 1)
                          }
                      }
                    : prev,
            { revalidate: false }
        );
    };

    const columns: ColumnDef<IPriceReviewItem>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'product_name',
            header: 'محصول'
        },
        {
            accessorKey: 'current_price',
            header: 'قیمت فعلی',
            cell: ({ row }) => row.original.current_price.toLocaleString('fa-IR')
        },
        {
            accessorKey: 'last_reviewed_at',
            header: 'آخرین بازبینی',
            cell: ({ row }) => formatPriceReviewDate(row.original.last_reviewed_at)
        },
        {
            accessorKey: 'days_overdue',
            header: 'روز تأخیر',
            cell: ({ row }) => row.original.days_overdue.toLocaleString('fa-IR')
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => (
                <ActionCell item={row.original} canManage={canManage} onConfirmed={handleConfirmed} />
            )
        }
    ];

    return (
        <ContentWrapper
            title='محصولات نیازمند بازبینی قیمت'
            extra={
                canManage ? (
                    <Link
                        href={ROUTES.PriceReviewSettings}
                        className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    >
                        تنظیمات بازه بازبینی
                    </Link>
                ) : undefined
            }
        >
            <div className='relative'>
                <Table<IPriceReviewItem>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={canView ? response?.items ?? [] : []}
                    loading={isLoading}
                />
            </div>

            <Pagination currentPage={page} total={response?.total ?? 0} pageSize={limit} onPageChange={setPage} />
        </ContentWrapper>
    );
};

export default List;
