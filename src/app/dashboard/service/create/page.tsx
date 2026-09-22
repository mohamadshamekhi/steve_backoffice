import { BreadCrumbs } from 'libs/components/common';
import { CreateService } from 'libs/components/pages/product';
import ROUTES from 'libs/constants/routes/routes.constants';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'لیست محصولات', href: ROUTES.Products },
        { label: 'درج خدمات' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <CreateService />
        </>
    );
};

export default Page;
