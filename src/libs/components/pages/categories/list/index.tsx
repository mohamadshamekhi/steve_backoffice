'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { CategoryModel } from 'libs/models';
import { Badge, Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import Detail from '../detail';
import Edit from '../edit';

interface AttributeItem {
    id: string;
    name: string;
}
interface categoryProps extends CategoryModel {
    attribute_set: AttributeItem[];
    ancestors?: {
        Name: string;
    }[];
}

interface ActionCellProps {
    data: categoryProps;
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

    const deleteCategory = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_CATEGORY(data.id), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete Category:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
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
                    <Edit onUpdated={onUpdated} id={data.id} onClose={closeModal} isOpen={isOpen} />
                </Case>

                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        onDelete={() => deleteCategory()}
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

    const { isLoading, data, mutate } = useSWR([ApiKeys.GET_ALL_CATEGORY, page, limit], () =>
        fetcher(ApiKeys.GET_ALL_CATEGORY, 'dashboard', 'GET', {
            params: {
                page_number: page,
                page_size: limit
            }
        })
    );

    const columns: ColumnDef<categoryProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'image',
            header: 'تصویر',
            cell: ({ row }) => {
                const name = row.getValue<string>('name');
                return <Image src={row.original.url} alt={name} width={60} height={60} />;
            },
            enableSorting: false
        },
        {
            accessorKey: 'name',
            header: 'نام ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'ancestors.name',
            header: 'نام سر دسته ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => {
                return <div>{row?.original?.ancestors && row?.original?.ancestors[0].Name}</div>;
            }
        },
        {
            accessorKey: 'attribute_set',
            header: 'ویژگی ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex flex-wrap gap-2'>
                    {row.original?.attribute_set &&
                        row.original?.attribute_set.map((item, index) => {
                            if (index < 3) return <Badge key={index}>{item.name}</Badge>;
                        })}

                    {row.original?.attribute_set && row?.original?.attribute_set.length > 3 ? <Badge>...</Badge> : ''}
                </div>
            )
        },
        {
            accessorKey: 'description',
            header: 'توضیحات ',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => <div className='max-w-[200px] truncate'>{row.getValue<string>('description')}</div>
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <ActionCell
                    onDeleted={() => {
                        mutate();
                    }}
                    onUpdated={() => {
                        mutate();
                    }}
                    data={row.original}
                />
            ),
            enableSorting: false
        }
    ];
    return (
        <ContentWrapper
            title='دسته بندی ها'
            extra={
                <Link
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    href={ROUTES.CreateCategory}
                >
                    درج دسته بندی +
                </Link>
            }
        >
            <div className='relative'>
                <Table<categoryProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.categories ?? []}
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
