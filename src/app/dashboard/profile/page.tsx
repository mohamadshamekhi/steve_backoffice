import { BreadCrumbs } from 'libs/components/common';
import Profile from 'libs/components/pages/Profile';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'پروفایل' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <Profile />
        </>
    );
};

export default page;
