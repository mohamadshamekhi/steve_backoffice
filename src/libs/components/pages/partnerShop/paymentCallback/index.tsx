'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ROUTES from 'libs/constants/routes/routes.constants';
import { IPartnerShopVerifyResponse } from 'libs/models/partnerShop.model';
import { Button } from 'libs/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PARTNER_TXN_STORAGE_KEY } from '../constants';

type State = 'verifying' | 'success' | 'failed';

const PaymentCallback = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const startedRef = useRef(false);

    const [state, setState] = useState<State>('verifying');
    const [result, setResult] = useState<IPartnerShopVerifyResponse | null>(null);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const txn =
            searchParams.get('gateway_transaction_id') ||
            searchParams.get('Authority') ||
            (typeof window !== 'undefined' ? sessionStorage.getItem(PARTNER_TXN_STORAGE_KEY) : null);

        if (!txn) {
            setState('failed');
            return;
        }

        (async () => {
            const res = await fetcher(ApiKeys.PARTNER_SHOP_PAYMENT_VERIFY, 'dashboard', 'POST', {
                body: { gateway_transaction_id: txn }
            });

            if (typeof window !== 'undefined') sessionStorage.removeItem(PARTNER_TXN_STORAGE_KEY);

            const payload: IPartnerShopVerifyResponse | undefined = res?.data;
            if (payload?.status === 'successful') {
                setResult(payload);
                setState('success');
            } else {
                setResult(payload ?? null);
                setState('failed');
            }
        })();
    }, [searchParams]);

    return (
        <ContentWrapper title='نتیجهٔ پرداخت'>
            <div className='flex min-h-[240px] flex-col items-center justify-center space-y-4 text-center'>
                {state === 'verifying' && (
                    <>
                        <span className='h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                        <p className='text-sm text-gray-500'>در حال بررسی وضعیت پرداخت...</p>
                    </>
                )}

                {state === 'success' && (
                    <>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-2xl text-success-600 dark:bg-success-500/15'>
                            ✓
                        </div>
                        <p className='font-semibold text-gray-800 dark:text-white/90'>
                            {result?.message || 'پرداخت با موفقیت انجام شد'}
                        </p>
                        {result?.tracking_code && (
                            <p className='text-sm text-gray-500'>
                                کد پیگیری: <span dir='ltr'>{result.tracking_code}</span>
                            </p>
                        )}
                        <Button onClick={() => router.push(ROUTES.PartnerShopMyOrders)}>مشاهدهٔ سفارش‌های من</Button>
                    </>
                )}

                {state === 'failed' && (
                    <>
                        <div className='bg-error-50 text-error-600 dark:bg-error-500/15 flex h-14 w-14 items-center justify-center rounded-full text-2xl'>
                            ✕
                        </div>
                        <p className='font-semibold text-gray-800 dark:text-white/90'>
                            {result?.message || 'پرداخت ناموفق بود'}
                        </p>
                        <div className='flex gap-2'>
                            <Button variant='outline' onClick={() => router.push(ROUTES.PartnerShopCart)}>
                                بازگشت به سبد خرید
                            </Button>
                            <Button onClick={() => router.push(ROUTES.PartnerShopMyOrders)}>سفارش‌های من</Button>
                        </div>
                    </>
                )}
            </div>
        </ContentWrapper>
    );
};

export default PaymentCallback;
