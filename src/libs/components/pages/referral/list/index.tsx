'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IReferralStats, IReferrerRow } from 'libs/models/referral.model';
import { Button, Input, Link, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import useSWR from 'swr';
import { formatPercent, formatReferralDate, REFERRAL_MANAGE, REFERRAL_ROLES, REFERRAL_VIEW } from '../constants';
import Detail from '../detail';

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className='mt-1 text-xl font-bold text-gray-900 dark:text-white'>{value}</p>
    </div>
);

const ActionCell = ({ row, canView }: { row: IReferrerRow; canView: boolean }) => {
    const { openModal, isOpen, closeModal } = useModal();

    return (
        <div>
            <Button onClick={openModal} size='sm' variant='outline' className='text-nowrap' disabled={!canView}>
                بررسی
            </Button>
            <Modal isOpen={isOpen} onClose={closeModal} className='max-h-[80vh] max-w-[860px] overflow-y-auto'>
                {isOpen && <Detail userId={row.user_id} />}
            </Modal>
        </div>
    );
};

const List = () => {
    const isMarketer = useRole(REFERRAL_ROLES);
    const canView = usePermission(REFERRAL_VIEW) || isMarketer;
    const canManage = usePermission(REFERRAL_MANAGE) || isMarketer;

    const [page, setPage] = useState(1);
    const [minJoined, setMinJoined] = useState('0');
    const limit = 25;

    const { data: statsData } = useSWR(ApiKeys.GET_REFERRAL_STATS, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );
    const stats: IReferralStats | undefined = statsData?.data;

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REFERRAL_LEADERBOARD, page, limit, minJoined],
        ([url, pageNum, pageSize, min]: [string, number, number, string]) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: pageNum, page_size: pageSize, min_joined: Number(min) || 0 }
            })
    );

    const columns: ColumnDef<IReferrerRow>[] = [
        {
            id: 'rowNumber',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            maxSize: 50
        },
        {
            accessorKey: 'referrer_name',
            header: 'دعوت‌کننده',
            cell: ({ row }) => (
                <div className='flex flex-col gap-0.5'>
                    <span className='font-medium'>{row.original.referrer_name || 'بدون نام'}</span>
                    <span dir='ltr' className='text-xs text-gray-500'>
                        {row.original.referrer_phone}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'code',
            header: 'کد دعوت',
            cell: ({ row }) => (
                <span dir='ltr' className='font-mono text-sm'>
                    {row.original.code}
                </span>
            )
        },
        {
            accessorKey: 'total_joined',
            header: 'کل عضو شده',
            cell: ({ row }) => row.original.total_joined.toLocaleString('fa-IR')
        },
        {
            accessorKey: 'rewarded_count',
            header: 'پاداش گرفته',
            cell: ({ row }) => row.original.rewarded_count.toLocaleString('fa-IR')
        },
        {
            accessorKey: 'pending_progress',
            header: 'در انتظار پاداش',
            cell: ({ row }) => row.original.pending_progress.toLocaleString('fa-IR')
        },
        {
            accessorKey: 'rewards_earned',
            header: 'پاداش کسب‌شده',
            cell: ({ row }) => row.original.rewards_earned.toLocaleString('fa-IR')
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ',
            cell: ({ row }) => formatReferralDate(row.original.created_at)
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => <ActionCell row={row.original} canView={canView} />,
            enableSorting: false
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5'>
                <StatCard label='کل حساب‌های دعوت' value={(stats?.total_accounts ?? 0).toLocaleString('fa-IR')} />
                <StatCard label='کل دعوت‌ها' value={(stats?.total_invites ?? 0).toLocaleString('fa-IR')} />
                <StatCard label='کل عضو شده' value={(stats?.total_joined ?? 0).toLocaleString('fa-IR')} />
                <StatCard label='کل پاداش‌ها' value={(stats?.total_rewards ?? 0).toLocaleString('fa-IR')} />
                <StatCard label='نرخ تبدیل' value={formatPercent(stats?.conversion_rate ?? 0)} />
            </div>

            <ContentWrapper
                title='لیدربرد دعوت‌کننده‌ها'
                extra={
                    canManage ? (
                        <Link
                            href={ROUTES.ReferralSettings}
                            className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                        >
                            تنظیمات تخفیف
                        </Link>
                    ) : undefined
                }
            >
                <div className='mb-4 flex items-end gap-2'>
                    <div>
                        <label className='mb-1 block text-xs text-gray-400'>حداقل تعداد عضو شده</label>
                        <Input
                            type='number'
                            min='0'
                            value={minJoined}
                            onChange={(e) => {
                                setMinJoined(e.target.value);
                                setPage(1);
                            }}
                            className='h-9 w-40'
                        />
                    </div>
                </div>

                <div className='relative'>
                    <Table<IReferrerRow>
                        headerClass='text-nowrap'
                        columns={columns}
                        data={data?.data?.items ?? []}
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
        </div>
    );
};

export default List;
