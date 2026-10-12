import { BreadCrumbs } from 'libs/components/common';
import { Settings } from 'libs/components/pages/priceReview';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'بازبینی قیمت', href: '/dashboard/price-review' },
        { label: 'تنظیمات' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <Settings />
        </>
    );
};

export default Page;
