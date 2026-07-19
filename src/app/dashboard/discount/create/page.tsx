import { BreadCrumbs } from 'libs/components/common';
import { Create } from 'libs/components/pages/discount';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'درج تخفیف' }];

    return (
        <>
            ‌<BreadCrumbs links={links} containerClass='mb-4' />
            <Create />
        </>
    );
};

export default Page;
