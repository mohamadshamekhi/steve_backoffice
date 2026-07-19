'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { useModal } from 'libs/hooks/modal/useModal';
import { Button, Switch, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

type User = {
    id: string;
    name: string;
    phone_number: string;
    national_code: string;
    address: string;
    zip_code: string;
    avatar_id: number;
    is_active: boolean;
    roles: string[];
};

interface ActionCellProps {
    data: User;
    onDeleted: () => void;
}

const toggleVisibilityHandler = async (id: string, currentState: boolean) => {
    try {
        console.log(id, currentState);
        // await fetcher(ApiKeys.PATCH_ARTICLE(id), 'dashboard', 'PATCH', { body: { is_active: !currentState } });

        toast.success('تغییر وضعیت با موفقیت انجام شد');
    } catch (error) {
        console.error('Failed to delete admin:', error);
    }
};

const getColumns = (onDeleted: () => void): ColumnDef<User>[] => [
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
        enableSorting: true
    },
    {
        accessorKey: 'roles',
        header: 'نقش',
        cell: ({ row }) => row.original.roles.join(', '),
        enableResizing: true,
        filterFn: 'includesString',
        enableSorting: true
    },
    {
        accessorKey: 'phone_number',
        header: 'شماره همراه',
        filterFn: 'includesString'
    },
    {
        accessorKey: 'address',
        header: 'آدرس',
        filterFn: 'includesString'
    },
    {
        accessorKey: 'is_active',
        header: 'وضعیت',
        cell: ({ row }) => (
            <Switch
                checked={row.original.is_active}
                onChange={() => toggleVisibilityHandler(row.original.id, row.original.is_active)}
            />
        )
    },
    {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => <ActionCell data={row.original} onDeleted={onDeleted} />
    }
];

const ActionCell = ({ data }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const deleteAdmin = async () => {
        try {
            setDeleteLoading(true);
            // await fetcher(ApiKeys.DELETE_ARTICLE(data.id), 'dashboard', 'DELETE');
            // onDeleted();
            // closeModal();
            // toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            // setDeleteLoading(false);
            console.error('Failed to delete blog:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='a'
                    href={`/dashboard/admin/edit/${data.id}`}
                    onItemClick={() => {
                        closeDropdown();
                    }}
                >
                    ویرایش
                </Dropdown.Item>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                    }}
                    className='text-red-500 hover:bg-red-100 hover:text-red-500'
                >
                    حذف
                </Dropdown.Item>
            </Dropdown>

            <DeleteModal isOpen={isOpen} onClose={closeModal} onDelete={() => deleteAdmin()} loading={deleteLoading} />
        </div>
    );
};
const List = () => {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_ALL_BACKOFFICE(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const columns = getColumns(() => mutate());

    return (
        <ContentWrapper
            title='لیست کاربران ادمین'
            extra={
                <Link className='rounded-md border border-gray-200 px-4 py-2' href='/dashboard/admin/create'>
                    درج ادمین
                </Link>
            }
        >
            <Table<User>
                cellClass='text-nowrap'
                headerClass='text-nowrap'
                columns={columns}
                data={data?.data?.backoffice ?? []}
                loading={isLoading}
            />
            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </ContentWrapper>
    );
};

export default List;
