import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { SupplierLedgerReport } from 'libs/components/pages/report';
import { REPORT_SUPPLIER_LEDGER } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'حساب تأمین‌کنندگان' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_SUPPLIER_LEDGER}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <SupplierLedgerReport />
            </PermissionGate>
        </>
    );
};

export default Page;
