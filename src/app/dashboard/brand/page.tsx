import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/brands';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست برند' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
