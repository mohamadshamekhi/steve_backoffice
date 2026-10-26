'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { IBirthdayReward } from 'libs/models/birthday.model';
import { Badge, Table } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';
import { formatDate } from '../constants';

const columns: ColumnDef<IBirthdayReward>[] = [
    {
        accessorKey: 'user_name',
        header: 'کاربر',
        cell: ({ row }) => (
            <div className='flex flex-col gap-0.5'>
                <span className='font-medium'>{row.original.user_name || 'بدون نام'}</span>
                <span dir='ltr' className='text-xs text-gray-500'>
                    {row.original.phone_number}
                </span>
            </div>
        )
    },
    {
        accessorKey: 'birthday_on',
        header: 'روز تولد',
        cell: ({ row }) => formatDate(row.original.birthday_on)
    },
    {
        accessorKey: 'discount_code',
        header: 'کد تخفیف',
        cell: ({ row }) => (
            <span dir='ltr' className='font-mono text-sm'>
                {row.original.discount_code || '-'}
            </span>
        )
    },
    {
        accessorKey: 'sms_sent',
        header: 'پیامک',
        cell: ({ row }) => (
            <Badge color={row.original.sms_sent ? 'success' : 'warning'}>
                {row.original.sms_sent ? 'ارسال شد' : 'ارسال نشد'}
            </Badge>
        )
    },
    {
        accessorKey: 'created_at',
        header: 'تاریخ صدور',
        cell: ({ row }) => formatDate(row.original.created_at)
    }
];

const Rewards = () => {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_BIRTHDAY_REWARDS, page, limit],
        ([url, pageNum, pageSize]: [string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', { params: { page_number: pageNum, page_size: pageSize } })
    );

    return (
        <ContentWrapper title='کدهای تولد صادرشده'>
            <div className='relative'>
                <Table<IBirthdayReward>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.items ?? []}
                    loading={isLoading}
                />
            </div>
            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </ContentWrapper>
    );
};

export default Rewards;
