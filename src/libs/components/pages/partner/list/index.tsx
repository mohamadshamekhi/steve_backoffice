'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { useModal } from 'libs/hooks/modal/useModal';
import { IPartner, PartnerStatus } from 'libs/models/partner.model';
import { Badge, Button, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { cn } from 'libs/utilities';
import { useState } from 'react';
import useSWR from 'swr';
import { formatPartnerDate, getPartnerStatusConfig, PARTNER_STATUS_TABS } from '../constants';
import Review from '../review';

const ActionCell = ({ data, onDone }: { data: IPartner; onDone: () => void }) => {
    const { openModal, isOpen, closeModal } = useModal();

    return (
        <div>
            <Button onClick={openModal} size='sm' variant='outline' className='text-nowrap'>
                بررسی
            </Button>

            <Modal isOpen={isOpen} onClose={closeModal} className='max-w-[720px]'>
                <Review
                    partner={data}
                    onDone={() => {
                        onDone();
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};

const List = () => {
    const [status, setStatus] = useState<'' | PartnerStatus>('pending');
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading, mutate } = useSWR(
        [ApiKeys.GET_ALL_PARTNERS, status, page, limit],
        ([url, s, pageNum, pageSize]: [string, string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { ...(s ? { status: s } : {}), page_number: pageNum, page_size: pageSize }
            })
    );

    const handleTabChange = (value: '' | PartnerStatus) => {
        setStatus(value);
        setPage(1);
    };

    const columns: ColumnDef<IPartner>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'company_name',
            header: 'نام شرکت',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='line-clamp-1 max-w-[200px] text-ellipsis'>{row.original.company_name || '-'}</div>
            )
        },
        {
            accessorKey: 'city',
            header: 'شهر',
            cell: ({ row }) => row.original.city || '-'
        },
        {
            accessorKey: 'business_field',
            header: 'حوزهٔ فعالیت',
            cell: ({ row }) => (
                <div className='line-clamp-1 max-w-[200px] text-ellipsis'>{row.original.business_field || '-'}</div>
            )
        },
        {
            accessorKey: 'national_id',
            header: 'کد ملی',
            cell: ({ row }) => (
                <span dir='ltr'>{row.original.national_id || '-'}</span>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ',
            cell: ({ row }) => formatPartnerDate(row.original.created_at)
        },
        {
            accessorKey: 'status',
            header: 'وضعیت',
            cell: ({ row }) => {
                const config = getPartnerStatusConfig(row.original.status);
                return <Badge color={config.color}>{config.label}</Badge>;
            }
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => <ActionCell data={row.original} onDone={() => mutate()} />,
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper title='مدیریت درخواست‌های همکاری'>
            <div className='mb-4 flex flex-wrap gap-2'>
                {PARTNER_STATUS_TABS.map((t) => (
                    <button
                        key={t.value || 'all'}
                        onClick={() => handleTabChange(t.value)}
                        className={cn(
                            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            status === t.value
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className='relative'>
                <Table<IPartner>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.partners ?? []}
                    loading={isLoading}
                />
            </div>

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
