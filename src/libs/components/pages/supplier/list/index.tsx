'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import DeleteModal from 'libs/components/common/DeleteModal/DeleteModal';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import {
    DEFAULT_PAGE_SIZE,
    formatDate,
    SUPPLIER_CREATE,
    SUPPLIER_DELETE,
    SUPPLIER_UPDATE
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { ISupplier } from 'libs/models/warehouse.model';
import { Badge, Button, CSelect, Input, Table } from 'libs/ui';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import SupplierForm from '../form';

const IS_ACTIVE_OPTIONS = [
    { value: '', label: 'همه' },
    { value: 'true', label: 'فعال' },
    { value: 'false', label: 'غیرفعال' }
];

const SupplierList = () => {
    const canCreate = usePermission(SUPPLIER_CREATE);
    const canUpdate = usePermission(SUPPLIER_UPDATE);
    const canDelete = usePermission(SUPPLIER_DELETE);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isActive, setIsActive] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ISupplier | null>(null);
    const [deleting, setDeleting] = useState<ISupplier | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_ALL_SUPPLIER, page, search, isActive],
        ([url, pageNum, searchValue, activeValue]: [string, number, string, string]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: {
                    page_number: pageNum,
                    page_size: DEFAULT_PAGE_SIZE,
                    ...(searchValue && { search: searchValue }),
                    ...(activeValue && { is_active: activeValue })
                }
            })
    );

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            const response = await fetcher(ApiKeys.DELETE_SUPPLIER(deleting.id), 'dashboard', 'DELETE');
            if (response?.success) {
                toast.success('تأمین‌کننده حذف شد');
                mutate();
                setDeleting(null);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: ColumnDef<ISupplier>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        { accessorKey: 'name', header: 'نام' },
        {
            accessorKey: 'shop_name',
            header: 'نام مغازه',
            cell: ({ row }) => row.original.shop_name || '-'
        },
        {
            accessorKey: 'phone_number',
            header: 'تلفن',
            cell: ({ row }) => (
                <span dir='ltr' className='font-mono text-sm'>
                    {row.original.phone_number || '-'}
                </span>
            )
        },
        {
            accessorKey: 'is_active',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Badge color={row.original.is_active ? 'success' : 'light'}>
                    {row.original.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            cell: ({ row }) => formatDate(row.original.created_at)
        },
        {
            id: 'actions',
            header: 'عملیات',
            enableSorting: false,
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Button
                        size='sm'
                        variant='outline'
                        className='text-nowrap'
                        disabled={!canUpdate}
                        onClick={() => {
                            setEditing(row.original);
                            setFormOpen(true);
                        }}
                    >
                        ویرایش
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='text-error-500 text-nowrap'
                        disabled={!canDelete}
                        onClick={() => setDeleting(row.original)}
                    >
                        حذف
                    </Button>
                </div>
            )
        }
    ];

    return (
        <ContentWrapper
            title='تأمین‌کنندگان'
            extra={
                canCreate ? (
                    <Button
                        size='sm'
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    >
                        افزودن تأمین‌کننده
                    </Button>
                ) : undefined
            }
        >
            <div className='mb-4 flex flex-wrap items-end gap-3'>
                <div className='w-full md:w-64'>
                    <label className='mb-1 block text-xs text-gray-400'>جست‌وجو (نام، مغازه، تلفن)</label>
                    <Input
                        name='search'
                        value={search}
                        placeholder='جست‌وجو...'
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className='w-full md:w-44'>
                    <label className='mb-1 block text-xs text-gray-400'>وضعیت</label>
                    <CSelect
                        name='is_active'
                        options={IS_ACTIVE_OPTIONS}
                        value={isActive}
                        onChange={(value) => {
                            setIsActive(value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <Table<ISupplier>
                headerClass='text-nowrap'
                columns={columns}
                data={data?.data?.suppliers ?? []}
                loading={isLoading}
            />

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
            />

            {formOpen && (
                <SupplierForm
                    isOpen={formOpen}
                    supplier={editing}
                    onClose={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                    mutate={mutate}
                />
            )}

            <DeleteModal
                isOpen={Boolean(deleting)}
                loading={deleteLoading}
                title='حذف تأمین‌کننده'
                description='تأمین‌کننده از لیست حذف می‌شود؛ فاکتورهای خرید ثبت‌شده‌ی او در تاریخچه باقی می‌مانند.'
                onClose={() => setDeleting(null)}
                onDelete={handleDelete}
            />
        </ContentWrapper>
    );
};

export default SupplierList;
