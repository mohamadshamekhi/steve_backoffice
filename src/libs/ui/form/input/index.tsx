import { cn } from 'libs/utilities';
import type { FC } from 'react';
import InputProps from './input.types';

const Input: FC<InputProps> = ({
    type = 'text',
    id,
    name,
    placeholder,
    value,
    onChange,
    onKeyDown,
    className = '',
    min,
    max,
    step,
    disabled = false,
    error = false,
    hint,
    maxLength,
    hintClass = '',
    dir = 'rtl',
    ...rest
}) => {
    return (
        <>
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                dir={dir}
                className={cn(
                    'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800ß h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                    disabled
                        ? 'focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 border-gray-300 bg-transparent text-gray-800 dark:border-gray-700 dark:text-white/90'
                        : '',
                    error
                        ? 'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800'
                        : '',
                    className
                )}
                maxLength={maxLength}
                {...rest}
            />

            {hint && <p className={`mt-1.5 text-xs ${hintClass}`}>{hint}</p>}
        </>
    );
};

export default Input;
