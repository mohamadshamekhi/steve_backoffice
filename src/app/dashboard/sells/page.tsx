import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/sells';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست درخواست های فروش' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
