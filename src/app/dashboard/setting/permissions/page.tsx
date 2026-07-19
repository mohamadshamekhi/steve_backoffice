import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/setting/permissions';

const page = () => {
    const links = [
        { label: 'داشبورد', href: '/' },
        { label: 'تنظیمات', href: '/dashboard/setting' },
        { label: 'لیست دسترسی‌ها' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
