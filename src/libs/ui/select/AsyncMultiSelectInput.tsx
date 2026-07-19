/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useId, useState } from 'react';
import AsyncSelect, { AsyncProps } from 'react-select/async';

type Option = { label: string; value: string };

interface AsyncMultiSelectInputProps extends Omit<AsyncProps<Option, true, any>, 'onChange' | 'value' | 'loadOptions'> {
    name: string;
    value: string[];
    error?: boolean;
    onChange: (value: string[]) => void;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    defaultOptions?: Option[] | boolean;
    initialOptions?: Option[];
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
    }),

    multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#F9FAFB',
        borderRadius: '6px',
        padding: '1px 12px 1px 8px',
        border: '1px solid #E5E7EB',
        cursor: 'pointer'
    }),

    multiValueLabel: (base: any) => ({
        ...base,
        color: '#1F2937',
        fontSize: '13px',
        fontWeight: '500'
    }),

    multiValueRemove: (base: any) => ({
        ...base,
        color: '#9CA3AF',
        ':hover': {
            backgroundColor: '#9CA3AF',
            color: 'white',
            cursor: 'pointer'
        }
    })
};

const AsyncMultiSelectInput: React.FC<AsyncMultiSelectInputProps> = ({
    name,
    value,
    error,
    onChange,
    loadOptions,
    initialOptions,
    ...props
}) => {
    const id = useId();
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(initialOptions || []);

    useEffect(() => {
        if (value.length > 0 && selectedOptions.length === 0) {
            loadOptions('').then((options) => {
                const found = options.filter((opt) => value.includes(opt.value));
                if (found.length > 0) {
                    setSelectedOptions(found);
                }
            });
        }
    }, [value, selectedOptions, loadOptions]);

    return (
        <AsyncSelect
            {...props}
            isMulti
            instanceId={id}
            name={name}
            value={selectedOptions}
            onChange={(options) => {
                const newOptions = options as Option[];
                setSelectedOptions(newOptions);
                onChange(newOptions.map((opt) => opt.value));
            }}
            loadOptions={loadOptions}
            classNamePrefix='react-select'
            placeholder='جستجو کنید...'
            isClearable
            cacheOptions
            defaultOptions
            loadingMessage={() => 'در حال جستجو...'}
            noOptionsMessage={() => 'نتیجه‌ای یافت نشد'}
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

export default AsyncMultiSelectInput;
