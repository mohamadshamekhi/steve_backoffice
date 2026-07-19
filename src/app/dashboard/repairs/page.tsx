import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/repairs';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست درخواست های تعمیر' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
