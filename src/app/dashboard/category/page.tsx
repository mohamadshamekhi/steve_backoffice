import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/categories';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست دسته بندی ها' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default Page;
