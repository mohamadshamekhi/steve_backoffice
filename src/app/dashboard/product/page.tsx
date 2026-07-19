import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/product';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست محصولات' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
