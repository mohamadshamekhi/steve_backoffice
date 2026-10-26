import { BreadCrumbs } from 'libs/components/common';
import { Rewards, Settings } from 'libs/components/pages/birthday';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'کد تخفیف تولد' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <div className='space-y-6'>
                <Settings />
                <Rewards />
            </div>
        </>
    );
};

export default Page;
