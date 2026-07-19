import { cn } from 'libs/utilities';
import ButtonProps from './button.types';
import sizeClasses from './size';
import variantClasses from './variant';

const Button: React.FC<ButtonProps> = ({
    children,
    size = 'md',
    variant = 'primary',
    startIcon,
    endIcon,
    onClick,
    className = '',
    disabled = false,
    type = 'button',
    loading = false,
    IconClass = ''
}) => {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
                sizeClasses[size]
            } ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {loading ? (
                <span className='h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-transparent'></span>
            ) : (
                <>
                    {startIcon && <span className={cn('flex items-center', IconClass)}>{startIcon}</span>}
                    {children}
                    {endIcon && <span className={cn('flex items-center', IconClass)}>{endIcon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
