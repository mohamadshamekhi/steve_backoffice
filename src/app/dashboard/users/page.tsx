import { BreadCrumbs } from 'libs/components/common';
import List from 'libs/components/pages/users/list';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'کاربران' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />

            <List />
        </>
    );
};

export default page;
