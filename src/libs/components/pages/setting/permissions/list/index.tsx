'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Table } from 'libs/ui';
import useSWR from 'swr';

interface PermissionProps {
    id: string;
    name: string;
    description: string;
}

const List: React.FC = () => {
    const { data, isLoading } = useSWR(ApiKeys.GET_ALL_PERMISSIONS, (url: string) => fetcher(url, 'dashboard', 'GET'));

    const columns: ColumnDef<PermissionProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'name',
            header: 'نام دسترسی',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'description',
            header: 'توضیحات',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper title='لیست دسترسی‌ها'>
            <div className='relative'>
                <Table<PermissionProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.permissions ?? []}
                    loading={isLoading}
                />
            </div>
        </ContentWrapper>
    );
};

export default List;
