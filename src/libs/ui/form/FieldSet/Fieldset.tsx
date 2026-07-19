import { cn } from 'libs/utilities';
import React from 'react';
import FieldsetProps from './fieldset.types';

const Fieldset: React.FC<FieldsetProps> = ({
    children,
    name,
    errors,
    touched,
    hint,
    label,
    className = '',
    labelClass = '',
    errorClass = '',
    hintClass = ''
}) => {
    const showError = touched?.[name] && errors?.[name];

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            {label && <label className={labelClass}>{label}</label>}
            {children}
            <div className={cn('text-xs text-gray-400', hintClass)}>{hint}</div>
            {showError && <div className={cn(`text-sm text-red-500`, errorClass)}>{errors[name]}</div>}
        </div>
    );
};

export default Fieldset;
