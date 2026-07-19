import { BreadCrumbs } from 'libs/components/common';
import { List } from 'libs/components/pages/banners';

const BannerPage = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'لیست بنرها' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <List />
        </>
    );
};

export default BannerPage;
