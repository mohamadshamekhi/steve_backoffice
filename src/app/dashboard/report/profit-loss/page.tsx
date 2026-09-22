import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { ProfitLossReport } from 'libs/components/pages/report';
import { REPORT_PROFIT_LOSS } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'صورت سود و زیان' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_PROFIT_LOSS}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <ProfitLossReport />
            </PermissionGate>
        </>
    );
};

export default Page;
