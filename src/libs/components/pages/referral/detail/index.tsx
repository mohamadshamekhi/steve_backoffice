'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import Pagination from 'libs/components/common/Pagination';
import { IReferralDetail } from 'libs/models/referral.model';
import { Badge } from 'libs/ui';
import { useState } from 'react';
import useSWR from 'swr';
import { formatReferralDate, INVITEE_SOURCE_CONFIG, INVITEE_STATUS_CONFIG } from '../constants';

const isFetchError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='flex justify-between gap-2 py-1.5 text-sm'>
        <span className='text-gray-400'>{label}</span>
        <span className='font-medium text-gray-800 dark:text-white/90'>{value ?? '-'}</span>
    </div>
);

const Detail = ({ userId }: { userId: string }) => {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading } = useSWR(
        [ApiKeys.GET_REFERRAL_DETAIL(userId), page, limit],
        ([url, pageNum, pageSize]: [string, number, number]) =>
            fetcher(url, 'dashboard', 'GET', { params: { page_number: pageNum, page_size: pageSize } })
    );

    if (isLoading) {
        return (
            <div className='flex min-h-[200px] items-center justify-center'>
                <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
            </div>
        );
    }

    if (isFetchError(data) || !data?.data) {
        return (
            <div className='py-10 text-center text-sm text-gray-400'>
                این کاربر هنوز کد دعوتی نساخته است.
            </div>
        );
    }

    const detail: IReferralDetail = data.data;
    const { account } = detail;

    return (
        <div className='mt-6 space-y-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white/90'>جزئیات دعوت‌کننده</h2>

            <div className='grid gap-4 md:grid-cols-2'>
                <div className='rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                    <SummaryRow label='نام' value={account.referrer_name} />
                    <SummaryRow
                        label='شماره تماس'
                        value={
                            <span dir='ltr'>{account.referrer_phone}</span>
                        }
                    />
                    <SummaryRow label='کد دعوت' value={<span dir='ltr'>{account.code}</span>} />
                    <SummaryRow label='تاریخ ساخت کد' value={formatReferralDate(account.created_at)} />
                </div>
                <div className='rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                    <SummaryRow label='کل عضو شده' value={account.total_joined.toLocaleString('fa-IR')} />
                    <SummaryRow label='پاداش گرفته' value={account.rewarded_count.toLocaleString('fa-IR')} />
                    <SummaryRow label='در انتظار پاداش' value={account.pending_progress.toLocaleString('fa-IR')} />
                    <SummaryRow label='پاداش کسب‌شده' value={account.rewards_earned.toLocaleString('fa-IR')} />
                </div>
            </div>

            <div>
                <h3 className='mb-2 font-medium text-gray-700 dark:text-gray-300'>دعوت‌شده‌ها</h3>
                <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800'>
                    <table className='w-full text-right text-sm'>
                        <thead className='bg-gray-50 text-gray-500 dark:bg-white/5'>
                            <tr>
                                <th className='p-3 font-medium'>نام</th>
                                <th className='p-3 font-medium'>شماره</th>
                                <th className='p-3 font-medium'>منبع</th>
                                <th className='p-3 font-medium'>وضعیت</th>
                                <th className='p-3 font-medium'>پاداش</th>
                                <th className='p-3 font-medium'>تاریخ عضویت</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                            {detail.referrals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='p-6 text-center text-gray-400'>
                                        دعوت‌شده‌ای ثبت نشده است.
                                    </td>
                                </tr>
                            ) : (
                                detail.referrals.map((invitee) => {
                                    const source = INVITEE_SOURCE_CONFIG[invitee.source] ?? {
                                        label: invitee.source,
                                        color: 'light' as const
                                    };
                                    const status = INVITEE_STATUS_CONFIG[invitee.status] ?? {
                                        label: invitee.status,
                                        color: 'light' as const
                                    };
                                    return (
                                        <tr key={invitee.id}>
                                            <td className='p-3'>{invitee.name || '-'}</td>
                                            <td className='p-3' dir='ltr'>
                                                {invitee.phone_masked}
                                            </td>
                                            <td className='p-3'>
                                                <Badge color={source.color} size='sm'>
                                                    {source.label}
                                                </Badge>
                                            </td>
                                            <td className='p-3'>
                                                <Badge color={status.color} size='sm'>
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td className='p-3'>
                                                {invitee.rewarded ? (
                                                    <Badge color='success' size='sm'>
                                                        داده شد
                                                    </Badge>
                                                ) : (
                                                    <span className='text-gray-400'>—</span>
                                                )}
                                            </td>
                                            <td className='p-3'>{formatReferralDate(invitee.joined_at)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={page}
                    total={detail.pagination?.total ?? 0}
                    pageSize={limit}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>

            <div>
                <h3 className='mb-2 font-medium text-gray-700 dark:text-gray-300'>کدهای پاداش صادرشده</h3>
                {detail.rewards.length === 0 ? (
                    <p className='text-sm text-gray-400'>هنوز پاداشی صادر نشده است.</p>
                ) : (
                    <ul className='space-y-2'>
                        {detail.rewards.map((reward) => (
                            <li
                                key={reward.id}
                                className='flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800'
                            >
                                <span className='font-mono font-medium' dir='ltr'>
                                    {reward.discount_code}
                                </span>
                                <span className='text-gray-400'>{formatReferralDate(reward.created_at)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Detail;
