import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { CashList } from 'libs/components/pages/cash';
import { CASH_VIEW } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'صندوق' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={CASH_VIEW}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <CashList />
            </PermissionGate>
        </>
    );
};

export default Page;
