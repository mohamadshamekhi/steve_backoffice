'use client';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Tab } from 'libs/ui';
import ProductAttribute from './productTab/attribute';
import ProductGallery from './productTab/gallery';
import ProductBaseInformation from './productTab/information';
import ProductSeo from './productTab/seo';
import ProductVariant from './productTab/variant';

const Edit = ({ id }: { id: string }) => {
    const tabs = [
        { id: 1, label: 'مشخصات محصول', content: <ProductBaseInformation id={id} /> },
        { id: 3, label: 'گالری', content: <ProductGallery id={id} /> },
        { id: 2, label: 'انواع محصول', content: <ProductVariant id={id} /> },
        { id: 4, label: 'ویژگی ها', content: <ProductAttribute id={id} /> },
        { id: 5, label: 'سئو و ترب', content: <ProductSeo id={id} /> }
    ];
    return (
        <ContentWrapper title='ویرایش محصول'>
            <Tab tabs={tabs} />
        </ContentWrapper>
    );
};

export default Edit;
