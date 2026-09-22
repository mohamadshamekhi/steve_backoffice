'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { IPurchase } from 'libs/models/warehouse.model';
import useSWR from 'swr';
import PurchaseForm from '../form';

/** Loads a draft purchase and hands it to the shared purchase form. */
const PurchaseEdit = ({ id }: { id: string }) => {
    const { data, isLoading } = useSWR([ApiKeys.GET_PURCHASE(id)], ([url]: [string]) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const purchase: IPurchase | undefined = data?.data?.purchase;

    if (isLoading) {
        return (
            <ContentWrapper title='ویرایش فاکتور خرید'>
                <div className='py-20 text-center text-sm text-gray-400'>در حال بارگذاری...</div>
            </ContentWrapper>
        );
    }

    if (!purchase) {
        return (
            <ContentWrapper title='ویرایش فاکتور خرید'>
                <div className='py-20 text-center text-sm text-gray-400'>فاکتوری یافت نشد.</div>
            </ContentWrapper>
        );
    }

    if (purchase.status !== 'draft') {
        return (
            <ContentWrapper title='ویرایش فاکتور خرید'>
                <div className='py-20 text-center text-sm text-gray-400'>
                    فقط فاکتورهای پیش‌نویس قابل ویرایش هستند. برای اصلاح، فاکتور را لغو و دوباره ثبت کنید.
                </div>
            </ContentWrapper>
        );
    }

    return <PurchaseForm purchase={purchase} />;
};

export default PurchaseEdit;
