import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/setting/shipping';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست نحوه ارسال' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default page;
