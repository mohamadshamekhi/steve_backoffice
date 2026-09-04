'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';
import Detail from '../detail';
import Edit from '../edit';

type Brand = {
    id: string;
    name: string;
    description: string;
    slug?: string;
    url: string;
};

interface ActionCellProps {
    data: Brand;
    onDeleted: () => void;
    onUpdated: () => void;
}

const ActionCell = ({ data, onUpdated, onDeleted }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);

    const { openModal, isOpen, closeModal } = useModal();

    const [modalType, setModalType] = useState('');

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);

    const closeDropdown = () => setIsOpenMenu(false);

    const deleteBrand = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_BRAND(data.id), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete Brand:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px] lg:left-40'>
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

                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        onDelete={() => deleteBrand()}
                        onClose={closeModal}
                        isOpen={isOpen}
                        loading={deleteLoading}
                    />
                </Case>

                <Case condition={modalType === 'detail'}>
                    <Detail id={data.id} isOpen={isOpen} onClose={closeModal} />
                </Case>
            </Switch>
        </div>
    );
};

const List = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { isLoading, data, mutate } = useSWR([ApiKeys.GET_ALL_BRAND, page, limit], () =>
        fetcher(ApiKeys.GET_ALL_BRAND, 'dashboard', 'GET', {
            params: {
                page_number: page,
                page_size: limit
            }
        })
    );

    const columns: ColumnDef<Brand>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'media_id',
            header: 'تصویر برند',
            cell: ({ row }) => {
                const name = row.getValue<string>('name');
                return (
                    <Image
                        className='rounded-md'
                        src={row.original.url ?? noPic}
                        alt={name}
                        width={60}
                        height={60}
                        loading='lazy'
                    />
                );
            },
            size: 60,
            enableSorting: false
        },
        {
            accessorKey: 'name',
            header: 'نام ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            size: 100
        },
        {
            accessorKey: 'description',
            header: 'توضیحات ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='line-clamp-2 max-w-[300px] overflow-ellipsis'>{row.original.description}</div>
            )
        },
        {
            accessorKey: 'slug',
            header: 'اسلاگ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) =>
                row.original.slug ? (
                    <span dir='ltr' className='font-mono text-sm'>
                        {row.original.slug}
                    </span>
                ) : (
                    <span className='text-xs text-red-500'>تنظیم نشده</span>
                )
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
            title='برندها'
            extra={
                <Link
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    href={ROUTES.CreateBrand}
                >
                    درج برند +
                </Link>
            }
        >
            <div className='relative'>
                <Table<Brand>
                    loading={isLoading}
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.brands ?? []}
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
