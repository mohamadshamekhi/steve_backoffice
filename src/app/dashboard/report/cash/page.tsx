import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { CashReport } from 'libs/components/pages/report';
import { REPORT_CASH } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'گزارش صندوق' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_CASH}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <CashReport />
            </PermissionGate>
        </>
    );
};

export default Page;
