import { cn } from 'libs/utilities';
import { LoadingStateProps } from './loading-state.types';

const LoadingState = ({
    title = 'در حال بارگذاری...',
    subtitle = 'از صبر و شکیبایی شما صمیمانه سپاس گزاریم..',
    className = '',
    titleClass = '',
    subtitleClass = '',
    loadingClass = ''
}: LoadingStateProps) => {
    return (
        <div className={cn('space-y-4 py-6 text-center', className)}>
            <span
                className={cn(
                    'mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-gray-400 border-t-transparent',
                    loadingClass
                )}
            />
            {title && <h3 className={cn('text-lg font-semibold text-gray-500', titleClass)}>{title}</h3>}
            {subtitle && <p className={cn('text-sm text-gray-400', subtitleClass)}>{subtitle}</p>}
        </div>
    );
};

export default LoadingState;
