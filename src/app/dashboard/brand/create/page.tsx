'use client';

import { BreadCrumbs } from 'libs/components/common';
import Create from 'libs/components/pages/brands/create';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'درج برند' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <Create />
        </>
    );
};

export default Page;
