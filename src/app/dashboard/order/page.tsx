import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/order';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست سفارشات' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
