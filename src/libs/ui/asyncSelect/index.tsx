/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Props as SelectProps } from 'react-select';
import AsyncSelect from 'react-select/async';

type Option = { label: string; value: string };

interface AsyncSelectInputProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value' | 'options'> {
    name: string;
    value: string;
    defaultOptions?: Option[];
    error?: boolean;
    onChange: (value: string) => void;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    debounceTime?: number;
    initialOption?: Option | null;
}

const customStyles = {
    indicatorSeparator: () => ({
        display: 'none'
    }),

    control: (base: any, state: any) => ({
        ...base,
        backgroundColor: '#fff',
        borderColor: state.isFocused ? '#d0d5dd' : '#d0d5dd',
        boxShadow: state.isFocused ? '0 0 0 1px #fff' : 'none',
        borderRadius: '6px',
        padding: '3px',
        '&:hover': {
            borderColor: '#DBEAFE'
        },
        minHeight: '2.5rem'
    }),

    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? '#ecebff' : state.isFocused ? '#ecebff' : 'white',
        color: state.isSelected ? '#465fff' : '#1F2937',
        cursor: 'pointer',
        borderRadius: '6px'
    }),

    singleValue: (base: any) => ({
        ...base,
        color: '#1f2937'
    }),

    menu: (base: any) => ({
        ...base,
        zIndex: 50,
        boxShadow: '0px 4px 8px rgba(31, 41, 55, 0.06), 0px 4px 4px rgba(31, 41, 55, 0.08)',
        padding: '4px',
        borderRadius: '6px'
    }),

    menuList: (base: any) => ({
        ...base,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '4px'
    })
};

const AsyncSelectInput: React.FC<AsyncSelectInputProps> = ({
    name,
    value,
    defaultOptions = [],
    error,
    onChange,
    loadOptions,
    debounceTime = 400,
    initialOption,
    ...props
}) => {
    const id = useId();
    const [selectedOption, setSelectedOption] = useState<Option | null>(
        initialOption || defaultOptions.find((opt) => opt.value === value) || null
    );
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync with initialOption when it arrives asynchronously
    useEffect(() => {
        if (initialOption && initialOption.value) {
            setSelectedOption(initialOption);
        }
    }, [initialOption]);

    const debouncedLoadOptions = useCallback(
        (inputValue: string, callback: (options: Option[]) => void) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                loadOptions(inputValue).then(callback);
            }, debounceTime);
        },
        [loadOptions, debounceTime]
    );

    const handleChange = (option: Option | null) => {
        setSelectedOption(option);
        onChange(option?.value || '');
    };

    return (
        <AsyncSelect
            {...props}
            instanceId={id}
            name={name}
            value={selectedOption}
            onChange={handleChange}
            loadOptions={debouncedLoadOptions}
            defaultOptions={defaultOptions.length > 0 ? defaultOptions : true}
            classNamePrefix='react-select'
            placeholder='جستجو کنید...'
            loadingMessage={() => 'در حال جستجو...'}
            noOptionsMessage={() => 'نتیجه‌ای یافت نشد'}
            isClearable
            cacheOptions
            styles={{
                ...customStyles,
                control: (base) => ({
                    ...base,
                    borderColor: error ? '#f87171' : base.borderColor,
                    '&:hover': { borderColor: error ? '#f87171' : base.borderColor },
                    minHeight: '2.8rem',
                    borderRadius: '8px'
                })
            }}
        />
    );
};

export default AsyncSelectInput;
