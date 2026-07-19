import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/cart';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست سبد خرید' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
