'use client';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import LoadingState from 'libs/ui/loadingState';
import { FC } from 'react';
import useSWR from 'swr';
import UserAddressCard from './UserProfile/UserAddressCard';
import UserInfoCard from './UserProfile/UserInfoCard';
import UserMetaCard from './UserProfile/UserMetaCard';

const Profile: FC = () => {
    const { data, isLoading } = useSWR(ApiKeys.ME, (url: string) => fetcher(url, 'dashboard', 'GET'));

    if (isLoading) return <LoadingState />;
    return (
        <>
            <ContentWrapper
                title='پروفایل'
                // extra={
                //     <Button
                //         variant='outline'
                //         className='flex items-center gap-2'
                //         startIcon={<EditIcon className='fill-current' />}
                //     >
                //         ویرایش
                //     </Button>
                // }
            >
                <div className='space-y-6'>
                    <UserMetaCard user={data?.data?.backoffice} />

                    <UserInfoCard user={data?.data?.backoffice} />

                    <UserAddressCard address={data?.data?.backoffice} />
                </div>
            </ContentWrapper>
        </>
    );
};

export default Profile;
