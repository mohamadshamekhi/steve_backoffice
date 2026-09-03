import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/referral';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'ریفرال' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default Page;
