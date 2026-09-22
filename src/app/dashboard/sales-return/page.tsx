import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { SalesReturnList } from 'libs/components/pages/salesReturn';
import { SALES_RETURN_LIST } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'مرجوعی‌ها' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={SALES_RETURN_LIST}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <SalesReturnList />
            </PermissionGate>
        </>
    );
};

export default Page;
