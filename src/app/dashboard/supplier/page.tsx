import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { SupplierList } from 'libs/components/pages/supplier';
import { SUPPLIER_LIST } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'تأمین‌کنندگان' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={SUPPLIER_LIST}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <SupplierList />
            </PermissionGate>
        </>
    );
};

export default Page;
