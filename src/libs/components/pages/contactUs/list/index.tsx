'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { useModal } from 'libs/hooks/modal/useModal';
import { IContactUs } from 'libs/models/contactUs.model';
import { Button, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import useSWR from 'swr';
import Detail from '../detail';

const ActionCell = ({ data }: { data: IContactUs }) => {
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

    const limit = 25;

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_ALL_CONTACT_US, page, limit],
        ([url, pageNum, pageSize]: [string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: pageSize }
            })
    );

    const columns: ColumnDef<IContactUs>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'Email',
            header: 'ایمیل',
            enableSorting: true
        },
        {
            accessorKey: 'PhoneNumber',
            header: 'شماره تماس',
            enableSorting: true
        },
        {
            accessorKey: 'Subject',
            header: 'موضوع',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='line-clamp-2 max-w-[300px] overflow-ellipsis'>{row.original.Subject}</div>
            )
        },
        {
            accessorKey: 'CreatedAt',
            header: 'تاریخ ثبت',
            enableSorting: true,
            cell: ({ row }) => <div>{new Date(row.original.CreatedAt).toLocaleDateString('fa-IR')}</div>
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => <ActionCell data={row.original} />,
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper title='لیست تماس با ما'>
            <div className='relative'>
                <Table<IContactUs>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.brands ?? []}
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
