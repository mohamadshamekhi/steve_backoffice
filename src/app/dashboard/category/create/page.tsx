import { BreadCrumbs } from 'libs/components/common';
import Create from 'libs/components/pages/categories/create';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'درج دسته بندی' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <Create />
        </>
    );
};

export default page;
