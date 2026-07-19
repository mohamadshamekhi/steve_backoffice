import { BreadCrumbs } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Create from 'libs/components/pages/users/admin/create';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'درج ادمین' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <ContentWrapper title='درج بلاگ'>
                <Create />
            </ContentWrapper>
        </>
    );
};

export default page;
