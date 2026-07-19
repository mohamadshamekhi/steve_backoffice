import BadgeProps from './badge.types';
import { sizeStyles } from './size';
import { variants } from './variants';

const Badge: React.FC<BadgeProps> = ({
    variant = 'light',
    color = 'primary',
    size = 'md',
    startIcon,
    endIcon,
    className,
    children
}) => {
    const sizeClass = sizeStyles[size];
    const colorStyles = variants[variant][color];

    return (
        <span
            className={`'inline-flex font-medium' items-center justify-center gap-1 rounded-full px-2.5 py-0.5 ${sizeClass} ${colorStyles} ${className}`}
        >
            {startIcon && <span className='ml-1'>{startIcon}</span>}
            {children}
            {endIcon && <span className='mr-1'>{endIcon}</span>}
        </span>
    );
};

export default Badge;
