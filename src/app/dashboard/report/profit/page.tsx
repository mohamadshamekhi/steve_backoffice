import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { ProfitReport } from 'libs/components/pages/report';
import { REPORT_PROFIT } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'گزارش سود و زیان' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_PROFIT}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <ProfitReport />
            </PermissionGate>
        </>
    );
};

export default Page;
