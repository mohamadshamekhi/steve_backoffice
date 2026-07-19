import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Detail } from 'libs/components/pages/blogs';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <ContentWrapper title='جزییات بلاگ'>
            <Detail id={id} />
        </ContentWrapper>
    );
}
