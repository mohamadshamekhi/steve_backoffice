import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/partner';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'درخواست‌های همکاری' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
