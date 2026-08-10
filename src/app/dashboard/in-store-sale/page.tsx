import { BreadCrumbs } from 'libs/components/common';
import InStoreSale from 'libs/components/pages/inStoreSale';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'ثبت خرید حضوری' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <InStoreSale />
        </>
    );
};

export default Page;

