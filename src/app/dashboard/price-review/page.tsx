import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/priceReview';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'بازبینی قیمت' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
