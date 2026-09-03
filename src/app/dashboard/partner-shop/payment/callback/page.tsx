import { BreadCrumbs } from 'libs/components/common';
import { PartnerShopGuard, PaymentCallback } from 'libs/components/pages/partnerShop';
import { Suspense } from 'react';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'خرید همکاری' }, { label: 'نتیجهٔ پرداخت' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PartnerShopGuard>
                <Suspense fallback={null}>
                    <PaymentCallback />
                </Suspense>
            </PartnerShopGuard>
        </>
    );
};

export default Page;
