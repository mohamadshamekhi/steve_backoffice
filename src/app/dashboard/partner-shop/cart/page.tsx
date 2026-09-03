import { BreadCrumbs } from 'libs/components/common';
import { Cart, PartnerShopGuard } from 'libs/components/pages/partnerShop';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'خرید همکاری' }, { label: 'سبد خرید' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PartnerShopGuard>
                <Cart />
            </PartnerShopGuard>
        </>
    );
};

export default Page;
