'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import SwitchProps from './switch.types';

const Switch = ({
    checked = false,
    onChange,
    size = 'md',
    variant = 'primary',
    disabled = false,
    id,
    ...rest
}: SwitchProps) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const newValue = e.target.checked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    const sizeClasses = {
        sm: {
            container: 'w-7 h-4',
            circle: 'w-3 h-3',
            translateOn: 'translate-x-3.5',
            translateOff: 'translate-x-0.5'
        },
        md: {
            container: 'w-12 h-6',
            circle: 'w-5 h-5',
            translateOn: 'translate-x-6',
            translateOff: 'translate-x-0.5'
        },
        lg: {
            container: 'w-16 h-8',
            circle: 'w-7 h-7',
            translateOn: 'translate-x-8',
            translateOff: 'translate-x-0.5'
        }
    };

    const variantColors = {
        primary: 'bg-brand-600',
        success: 'bg-green-600',
        secondary: 'bg-secondary-600',
        black: 'bg-black',
        gray: 'bg-gray-600'
    };

    const currentSize = sizeClasses[size];
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);
    return (
        <div className='relative'>
            <label className='flex h-full cursor-pointer'>
                <input
                    type='checkbox'
                    role='switch'
                    id={id}
                    className='sr-only'
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...rest}
                />
                <div
                    className={clsx(
                        'relative inline-flex items-center rounded-full transition-colors duration-300',
                        currentSize.container,
                        {
                            [variantColors[variant]]: isChecked,
                            'bg-gray-300': !isChecked,
                            'cursor-not-allowed opacity-50': disabled
                        }
                    )}
                >
                    <span
                        className={clsx(
                            'absolute top-0.5 left-0 transform rounded-full bg-white shadow transition duration-300',
                            currentSize.circle,
                            isChecked ? currentSize.translateOn : currentSize.translateOff
                        )}
                    />
                </div>
            </label>
        </div>
    );
};

export default Switch;
