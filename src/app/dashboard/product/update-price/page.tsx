import { BreadCrumbs } from 'libs/components/common';
import { UpdatePrice } from 'libs/components/pages/product';

const page = () => {
    const links = [
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '/dashboard/product' },
        { label: 'اپدیت کردن قیمت گوشی و تبلت' }
    ];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <UpdatePrice />
        </>
    );
};

export default page;
