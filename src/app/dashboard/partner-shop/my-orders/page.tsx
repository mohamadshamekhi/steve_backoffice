import { BreadCrumbs } from 'libs/components/common';
import { MyOrders, PartnerShopGuard } from 'libs/components/pages/partnerShop';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'خرید همکاری' }, { label: 'سفارش‌های من' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PartnerShopGuard>
                <MyOrders />
            </PartnerShopGuard>
        </>
    );
};

export default Page;
