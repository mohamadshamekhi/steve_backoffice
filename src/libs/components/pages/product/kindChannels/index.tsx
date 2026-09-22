'use client';

import { PRODUCT_KIND_OPTIONS, SALES_CHANNEL_OPTIONS } from 'libs/constants/warehouse/warehouse.constants';
import { ProductKind, SalesChannel } from 'libs/models/warehouse.model';

interface IProps {
    kind: ProductKind;
    salesChannels: SalesChannel[];
    onKindChange: (kind: ProductKind) => void;
    onChannelsChange: (channels: SalesChannel[]) => void;
    error?: string;
    /** When the kind is fixed by the page (product vs. service form), the radios are replaced by a note. */
    lockedKindNote?: string;
}

/** Product kind (physical/service) + sales channels, shared by the create and edit product forms. */
const ProductKindChannels = ({
    kind,
    salesChannels,
    onKindChange,
    onChannelsChange,
    error,
    lockedKindNote
}: IProps) => {
    const toggleChannel = (channel: SalesChannel) => {
        onChannelsChange(
            salesChannels.includes(channel)
                ? salesChannels.filter((item) => item !== channel)
                : [...salesChannels, channel]
        );
    };

    const hideFromWebsite = !salesChannels.includes('website');

    return (
        <div className='col-span-2 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 dark:border-gray-800'>
            <div>
                <p className='mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>نوع قلم</p>
                {lockedKindNote ? (
                    <p className='rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/[0.03]'>
                        {lockedKindNote}
                    </p>
                ) : (
                <div className='space-y-2'>
                    {PRODUCT_KIND_OPTIONS.map((option) => (
                        <label key={option.value} className='flex cursor-pointer items-start gap-2 text-sm'>
                            <input
                                type='radio'
                                name='kind'
                                value={option.value}
                                checked={kind === option.value}
                                onChange={() => onKindChange(option.value)}
                                className='accent-brand-500 mt-1 h-4 w-4'
                            />
                            <span>
                                <span className='block text-gray-800 dark:text-white/90'>{option.label}</span>
                                <span className='block text-xs text-gray-400'>{option.hint}</span>
                            </span>
                        </label>
                    ))}
                </div>
                )}
            </div>

            <div>
                <p className='mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>کانال فروش</p>
                <div className='space-y-2'>
                    {SALES_CHANNEL_OPTIONS.map((option) => (
                        <label key={option.value} className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input
                                type='checkbox'
                                checked={salesChannels.includes(option.value)}
                                onChange={() => toggleChannel(option.value)}
                                className='accent-brand-500 h-4 w-4'
                            />
                            <span className='text-gray-800 dark:text-white/90'>{option.label}</span>
                        </label>
                    ))}
                </div>

                {hideFromWebsite && salesChannels.length > 0 && (
                    <p className='text-warning-600 dark:text-warning-500 mt-2 text-xs'>
                        این قلم در سایت دیده نمی‌شود و فقط در فاکتور حضوری قابل انتخاب است.
                    </p>
                )}

                {error && <p className='mt-2 text-xs text-red-500'>{error}</p>}
            </div>
        </div>
    );
};

export default ProductKindChannels;
