import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/blogs';

const Page: React.FC = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست بلاگ' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default Page;
