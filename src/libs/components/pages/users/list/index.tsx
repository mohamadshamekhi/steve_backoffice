'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { useModal } from 'libs/hooks/modal/useModal';
import { Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import { useState } from 'react';
import useSWR from 'swr';
import Detail from '../detail';
import Edit from '../edit';

type User = {
    id: string;
    _id: string;
    name: string;
    phone_number: string;
    created_at: string;
};

interface ActionCellProps {
    data: User;
    onUpdated: () => void;
}

const ActionCell = ({ data, onUpdated }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();
    const [modalType, setModalType] = useState('');

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='z-20 min-w-[150px] md:left-40'>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('detail');
                    }}
                >
                    جزییات
                </Dropdown.Item>
                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('edit');
                    }}
                >
                    ویرایش
                </Dropdown.Item>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('delete');
                    }}
                    className='text-red-500 hover:bg-red-100 hover:text-red-500'
                >
                    حذف
                </Dropdown.Item>
            </Dropdown>

            <Switch>
                <Case condition={modalType === 'edit'}>
                    <Edit onUpdated={onUpdated} data={data} onClose={closeModal} isOpen={isOpen} />
                </Case>

                <Case condition={modalType === 'detail'}>
                    <Detail data={data} isOpen={isOpen} onClose={closeModal} />
                </Case>
            </Switch>
        </div>
    );
};
const List = () => {
    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_ALL_USER, (url: string) => fetcher(url, 'dashboard', 'GET'));

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
            maxSize: 50,
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'name',
            header: 'نام ',
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
            accessorKey: 'created_at',
            header: 'تاریخ ورود',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row?.original?.created_at).toLocaleDateString('fa-IR');
            }
        },

        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <ActionCell
                    data={row.original}
                    onUpdated={() => {
                        mutate();
                    }}
                />
            ),
            enableSorting: false
        }
    ];
    return (
        <ContentWrapper title='لیست کاربران'>
            <Table<User>
                cellClass='text-nowrap'
                headerClass='text-nowrap'
                columns={columns}
                data={data?.data?.users ?? []}
                loading={isLoading}
            />
        </ContentWrapper>
    );
};

export default List;
