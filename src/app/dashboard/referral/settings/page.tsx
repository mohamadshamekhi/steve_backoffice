import { BreadCrumbs } from 'libs/components/common';
import { Settings } from 'libs/components/pages/referral';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'ریفرال', href: '/dashboard/referral' },
        { label: 'تنظیمات تخفیف' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <Settings />
        </>
    );
};

export default Page;
