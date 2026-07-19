import { BreadCrumbs } from 'libs/components/common';
import List from 'libs/components/pages/users/admin/list';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست کاربران ادمین' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <List />
        </>
    );
};

export default page;
