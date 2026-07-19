import { clsx } from 'clsx';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import LabelProps from './label.types';

const Label: FC<LabelProps> = ({ htmlFor, children, className = '', ...rest }) => {
    return (
        <label
            htmlFor={htmlFor}
            className={clsx(twMerge('mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400', className))}
            {...rest}
        >
            {children}
        </label>
    );
};

export default Label;
