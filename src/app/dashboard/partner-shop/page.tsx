import { BreadCrumbs } from 'libs/components/common';
import { Catalog, PartnerShopGuard } from 'libs/components/pages/partnerShop';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'خرید همکاری' }, { label: 'کاتالوگ محصولات' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PartnerShopGuard>
                <Catalog />
            </PartnerShopGuard>
        </>
    );
};

export default Page;
