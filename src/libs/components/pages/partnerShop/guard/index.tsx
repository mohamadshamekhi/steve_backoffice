'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IPartnerShopMe } from 'libs/models/partnerShop.model';
import { Badge } from 'libs/ui';
import { createContext, useContext } from 'react';
import useSWR from 'swr';
import { PARTNER_SHOP_ACCESS } from '../constants';

const PartnerShopMeContext = createContext<IPartnerShopMe | null>(null);

export const usePartnerShopMe = () => useContext(PartnerShopMeContext);

const CenteredMessage = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className='flex min-h-[320px] flex-col items-center justify-center space-y-3 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]'>
        <h2 className='text-lg font-semibold text-gray-700 dark:text-white/90'>{title}</h2>
        {subtitle && <p className='max-w-md text-sm text-gray-400'>{subtitle}</p>}
    </div>
);

const STATUS_MESSAGE: Record<string, string> = {
    pending: 'درخواست همکاری شما هنوز در حال بررسی است. پس از تأیید، امکان خرید فعال می‌شود.',
    rejected: 'درخواست همکاری شما رد شده است.',
    suspended: 'حساب همکاری شما به‌صورت موقت تعلیق شده است. برای پیگیری با پشتیبانی تماس بگیرید.'
};

const PartnerShopGuard = ({ children }: { children: React.ReactNode }) => {
    const hasAccessPermission = usePermission(PARTNER_SHOP_ACCESS);
    const isPartner = useRole('partner');
    const hasAccess = hasAccessPermission || isPartner;

    const { data, isLoading, error } = useSWR(hasAccess ? ApiKeys.PARTNER_SHOP_ME : null, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    if (!hasAccess) {
        return <CenteredMessage title='دسترسی پنل همکاری برای شما فعال نیست.' />;
    }

    if (isLoading) {
        return (
            <div className='flex min-h-[320px] items-center justify-center'>
                <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
            </div>
        );
    }

    const me: IPartnerShopMe | undefined = data?.data;

    if (error || !me || (typeof data?.status === 'number' && data.status >= 400)) {
        return <CenteredMessage title='دسترسی پنل همکاری برای شما فعال نیست.' />;
    }

    if (me.status !== 'approved') {
        return (
            <CenteredMessage
                title='دسترسی پنل همکاری فعال نیست.'
                subtitle={STATUS_MESSAGE[me.status] ?? undefined}
            />
        );
    }

    return (
        <PartnerShopMeContext.Provider value={me}>
            <div className='mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-white/[0.03]'>
                <div>
                    <p className='text-sm text-gray-400'>پنل خرید همکاری</p>
                    <p className='font-semibold text-gray-800 dark:text-white/90'>{me.company_name || '—'}</p>
                </div>
                <Badge color='success'>تخفیف همکار: {me.discount_percent}%</Badge>
            </div>
            {children}
        </PartnerShopMeContext.Provider>
    );
};

export default PartnerShopGuard;
