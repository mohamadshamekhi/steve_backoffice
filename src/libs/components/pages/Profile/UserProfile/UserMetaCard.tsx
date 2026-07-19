'use client';
import Image from 'next/image';
interface userProps {
    user: {
        img: string;
        name?: string;
        roles: string[];
        address?: string;
    };
}
const UserMetaCard = ({ user }: userProps) => {
    return (
        <>
            <div className='rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800'>
                <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
                    <div className='flex w-full flex-col items-center gap-6 xl:flex-row'>
                        <div className='h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800'>
                            <Image
                                width={24}
                                height={24}
                                src={user.img ? user.img : '/images/placeholder/avatar.png'}
                                alt='user'
                                className='aspect-square w-full rounded-full'
                            />
                        </div>
                        <div className='order-3 xl:order-2'>
                            <h4 className='mb-2 text-center text-lg font-semibold text-gray-800 xl:text-right dark:text-white/90'>
                                {user?.name}
                            </h4>
                            <div className='flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left'>
                                <p className='text-sm text-gray-500 dark:text-gray-400'> {user.roles[0]}</p>
                                <div className='hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700'></div>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>{user.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default UserMetaCard;
