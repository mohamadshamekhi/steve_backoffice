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
import Edit from '../edit';

interface ShippingProps {
    id: string;
    name: string;
    cost: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ActionCellProps {
    data: ShippingProps;
    onChanged: () => void;
}

const ActionCell = ({ data, onChanged }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();
    const [modalType, setModalType] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const deactivateShipping = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.PATCH_SHIPPING(data.id), 'dashboard', 'PATCH', {
                body: { is_active: false }
            });
            onChanged();
            closeModal();
            toast.success('نحوه ارسال غیرفعال شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to deactivate shipping:', error);
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
                    <Edit onUpdated={onChanged} id={data.id} onClose={closeModal} isOpen={isOpen} />
                </Case>

                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        title='غیرفعال کردن'
                        description='این نحوه ارسال حذف نمی‌شود، فقط غیرفعال می‌گردد. مطمئن هستید؟'
                        onDelete={() => deactivateShipping()}
                        onClose={closeModal}
                        isOpen={isOpen}
                        loading={deleteLoading}
                    />
                </Case>
            </Switch>
        </div>
    );
};

const List: React.FC = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading, mutate } = useSWR(ApiKeys.GET_ALL_SHIPPING(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

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
            accessorKey: 'is_active',
            header: 'وضعیت',
            enableSorting: false,
            cell: ({ row }) =>
                row?.original?.is_active ? (
                    <Badge color='success'>فعال</Badge>
                ) : (
                    <Badge color='error'>غیرفعال</Badge>
                )
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
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => <ActionCell data={row.original} onChanged={() => mutate()} />
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
