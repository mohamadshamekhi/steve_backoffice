import { cn } from 'libs/utilities';
import Image from 'next/image';
import defaultImage from '../../../../public/images/placeholder/empty-state.png';
import { EmptyStateProps } from './empty-state.types';

const EmptyState = ({
    title = 'هنوز محتوایی ثبت نشده',
    subtitle = 'برای شروع، مورد جدیدی اضافه کنید یا اطلاعات بیشتری وارد نمایید.',
    img = defaultImage,
    className = '',
    imgClass = '',
    titleClass = '',
    subtitleClass = '',
    loading = false
}: EmptyStateProps) => {
    if (loading) return <>loading empty state...</>;

    return (
        <div className={cn('space-y-4 py-6 text-center', className)}>
            <Image
                loading='lazy'
                className={cn('mx-auto', imgClass)}
                src={img}
                width={200}
                height={150}
                alt='تصویر حالت خالی'
            />

            {title && <h3 className={cn('text-lg font-semibold text-gray-500', titleClass)}>{title}</h3>}
            {subtitle && <p className={cn('text-sm text-gray-400', subtitleClass)}>{subtitle}</p>}
        </div>
    );
};

export default EmptyState;
