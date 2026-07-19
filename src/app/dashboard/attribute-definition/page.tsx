import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/attributeDefinition';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست ساختار ویژگی' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
