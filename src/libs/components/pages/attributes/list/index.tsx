'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { Badge, Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import Detail from '../detail';
import Edit from '../edit';

type Attribute = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    attributes: SubAttribute[];
    attribute_definition_ids: string[];
};

type SubAttribute = {
    id: string;
    name: string;
};

interface ActionCellProps {
    data: Attribute;
    onDeleted: () => void;
    onUpdated: () => void;
}

const ActionCell = ({ data, onUpdated, onDeleted }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);

    const { openModal, isOpen, closeModal } = useModal();

    const [modalType, setModalType] = useState('');

    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const deleteAttribute = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_ATTRIBUTE(data.id), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            setDeleteLoading(false);
            toast.success('حذف با موفقیت انجام شد');
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete Attribute:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
                <Dropdown.Item
                    className='text-gray-500! hover:bg-gray-50 hover:text-gray-600'
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
                    <Detail data={data} onClose={closeModal} isOpen={isOpen} id={data.id} name={data.name} />
                </Case>

                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        onDelete={() => deleteAttribute()}
                        onClose={closeModal}
                        isOpen={isOpen}
                        loading={deleteLoading}
                    />
                </Case>
            </Switch>
        </div>
    );
};

const List = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_ALL_ATTRIBUTE(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const columns: ColumnDef<Attribute>[] = [
        {
            id: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },

        {
            accessorKey: 'name',
            header: 'نام ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'key',
            header: 'زیرمجموعه ها',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-wrap items-center gap-2'>
                        {row.original?.attributes.map((item, index) => {
                            if (index < 3)
                                return (
                                    <Badge className='text-nowrap' key={index}>
                                        {item.name}
                                    </Badge>
                                );
                        })}
                        {row.original?.attributes.length > 3 ? <Badge>...</Badge> : ''}
                    </div>
                );
            }
        },

        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            filterFn: 'includesString',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fa-ir')
        },
        {
            accessorKey: 'updated_at',
            header: 'تاریخ ویرایش',
            filterFn: 'includesString',
            cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString('fa-ir')
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <ActionCell
                    data={row.original}
                    onDeleted={() => {
                        mutate();
                    }}
                    onUpdated={() => {
                        mutate();
                    }}
                />
            ),
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper
            title='لیست ویژگی ها'
            extra={
                <Link
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    href={ROUTES.CreateAttribute}
                >
                    درج ویژگی ها +
                </Link>
            }
        >
            <div className='relative'>
                <Table<Attribute>
                    loading={isLoading}
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.attributes ?? []}
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
