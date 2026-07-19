'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { Table } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';

interface CartProps {
    id: string;
    user_name: string;
    user_phone_number: string;
    media_url: string;
    status: string;
}

const List: React.FC = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading } = useSWR(ApiKeys.GET_ALL(page, limit), (url: string) => fetcher(url, 'dashboard', 'GET'));

    const columns: ColumnDef<CartProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'user_name',
            header: 'نام مشتری',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'user_phone_number',
            header: 'شماره همراه مشتری',
            filterFn: 'includesString'
        },
        {
            accessorKey: 'status',
            header: 'وضعیت',
            filterFn: 'includesString'
        }
    ];
    return (
        <ContentWrapper title='لیست سبد خرید'>
            <div className='relative'>
                <Table<CartProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.carts ?? []}
                    loading={isLoading}
                />
            </div>

            <Pagination
                currentPage={page}
                total={data?.data?.pagination.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </ContentWrapper>
    );
};

export default List;
