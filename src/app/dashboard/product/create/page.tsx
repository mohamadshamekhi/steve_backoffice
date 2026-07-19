import { BreadCrumbs } from 'libs/components/common';
import { Create } from 'libs/components/pages/product';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'درج محصول' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <Create />
        </>
    );
};

export default page;
