import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/contactUs';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست تماس با ما' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
