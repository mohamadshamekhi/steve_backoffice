interface IAddressProps {
    address?: string;
    zip_code?: string;
}

const UserAddressCard = ({ address }: { address: IAddressProps }) => {
    return (
        <>
            <div className='rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                    <div>
                        <h4 className='text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90'>آدرس</h4>

                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32'>
                            <div>
                                <p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>شهر</p>
                                <p className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                    {address.address}
                                </p>
                            </div>

                            <div>
                                <p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>کد پستی</p>
                                <p className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                    {address.zip_code}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserAddressCard;
