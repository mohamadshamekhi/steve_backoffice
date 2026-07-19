'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { Table } from 'libs/ui';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

interface ShippingProps {
    id: string;
    name: string;
    cost: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const List: React.FC = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading } = useSWR(ApiKeys.GET_ALL_SHIPPING, (url: string) => fetcher(url, 'dashboard', 'GET'));

    const columns: ColumnDef<ShippingProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },

        {
            accessorKey: 'name',
            header: 'نام',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => <div className='line-clamp-1 text-ellipsis'>{row?.original?.name}</div>
        },
        {
            accessorKey: 'description',
            header: 'توضیحات',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: false,
            cell: ({ row }) => <div className='line-clamp-1 text-ellipsis'>{row?.original?.description}</div>
        },

        {
            accessorKey: 'cost',
            header: 'هزینه',
            filterFn: 'includesString'
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row?.original?.created_at).toLocaleDateString('fa-IR');
            }
        },
        {
            accessorKey: 'updated_at',
            header: 'تاریخ ویرایش',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row?.original?.updated_at).toLocaleDateString('fa-IR');
            }
        }
    ];
    return (
        <ContentWrapper
            title='لیست نحوه ارسال'
            extra={
                <Link
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    href={ROUTES.CreateShipping}
                >
                    درج نحوه ارسال +
                </Link>
            }
        >
            <div className='relative'>
                <Table<ShippingProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.shipping ?? []}
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
