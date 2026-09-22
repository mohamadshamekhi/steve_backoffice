import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { ExpenseList } from 'libs/components/pages/expense';
import { EXPENSE_LIST } from 'libs/constants/accounting/accounting.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'هزینه‌ها' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={EXPENSE_LIST}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <ExpenseList />
            </PermissionGate>
        </>
    );
};

export default Page;
