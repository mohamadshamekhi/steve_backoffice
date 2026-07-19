'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { useModal } from 'libs/hooks/modal/useModal';
import { IComment } from 'libs/models/comment.model';
import { Badge, Button, Switch as CSwitch, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import Detail from '../detail';

const ActionCell = ({ data }: { data: IComment }) => {
    const { openModal, isOpen, closeModal } = useModal();

    return (
        <div>
            <Button onClick={openModal} size='sm' variant='outline' className='text-nowrap'>
                نمایش جزییات
            </Button>

            <Modal isOpen={isOpen} onClose={closeModal} className='max-h-[600px] max-w-[800px] overflow-y-auto'>
                <Detail data={data} />
            </Modal>
        </div>
    );
};

const List = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading, mutate } = useSWR(ApiKeys.GET_ALL_COMMENT(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const toggleVisibilityHandler = async (id: string, currentState: boolean) => {
        try {
            await fetcher(ApiKeys.PATCH_COMMENT(id), 'dashboard', 'POST', { body: { is_approved: !currentState } });
            mutate();
            toast.success('تغییر وضعیت با موفقیت انجام شد');
        } catch (error) {
            console.error('Failed to delete blog:', error);
        }
    };

    const columns: ColumnDef<IComment>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'body',
            header: 'توضیحات',
            enableSorting: true,
            cell: ({ row }) => <div className='line-clamp-2 max-w-[300px] overflow-ellipsis'>{row.original.body}</div>
        },

        {
            accessorKey: 'type',
            header: 'منبع',
            enableSorting: true,
            cell: ({ row }) => {
                if (row.original.commentable.type === 'article') return <Badge color='success'>بلاگ</Badge>;
                return <Badge color='primary'>محصولات</Badge>;
            }
        },
        {
            accessorKey: 'title',
            header: 'مرتبط با',
            enableSorting: true,
            cell: ({ row }) => <div className='max-w-[150px] overflow-ellipsis'>{row.original.commentable.title}</div>
        },
        {
            accessorKey: 'is_approved',
            header: 'نمایش/عدم نمایش',
            cell: ({ row }) => (
                <CSwitch
                    checked={row.original.is_approved}
                    onChange={() => toggleVisibilityHandler(row.original.id, row.original.is_approved)}
                />
            ),
            enableSorting: false
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            enableSorting: true,
            cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleDateString('fa-ir')}</div>
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => <ActionCell data={row.original} />,
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper title='لیست نظرات'>
            <div className='relative'>
                <Table<IComment>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.comments ?? []}
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
