import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/setting/roles';

const page = () => {
    const links = [
        { label: 'داشبورد', href: '/' },
        { label: 'تنظیمات', href: '/dashboard/setting' },
        { label: 'لیست نقش‌ها' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
