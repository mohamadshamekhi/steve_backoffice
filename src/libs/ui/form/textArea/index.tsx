import { cn } from 'libs/utilities';
import React from 'react';
import TextareaProps from './text-area.types';

const TextArea: React.FC<TextareaProps> = ({
    placeholder = '',
    name = '',
    rows = 3,
    value = '',
    className = '',
    disabled = false,
    error = false,
    hint = '',
    hintClass = '',
    ...rest
}) => {
    return (
        <div className='relative'>
            <textarea
                name={name}
                placeholder={placeholder}
                rows={rows}
                value={value}
                disabled={disabled}
                className={cn(
                    'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90',
                    disabled
                        ? 'opacity40 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        : '',
                    error
                        ? 'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800'
                        : '',
                    className
                )}
                {...rest}
            />
            {hint && <p className={`mt-1.5 text-xs ${hintClass}`}>{hint}</p>}
        </div>
    );
};

export default TextArea;
