import { BreadCrumbs } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Create } from 'libs/components/pages/setting/shipping';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'درج نحوه ارسال جدید' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <ContentWrapper title='درج نحوه ارسال جدید'>
                <Create />
            </ContentWrapper>
        </>
    );
};

export default page;
