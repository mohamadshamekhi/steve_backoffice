/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useId, useState } from 'react';
import AsyncSelect from 'react-select/async';

type Option = { label: string; value: string };

interface AsyncMultiSelectProps {
    name: string;
    value: string[];
    error?: boolean;
    onChange: (values: string[]) => void;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    placeholder?: string;
    defaultOptions?: Option[] | boolean;
    isLoading?: boolean;
    initialOptions?: Option[];
}

const customStyles = {
    indicatorSeparator: () => ({ display: 'none' }),

    control: (base: any, state: any) => ({
        ...base,
        backgroundColor: '#fff',
        borderColor: state.isFocused ? '#d0d5dd' : '#d0d5dd',
        boxShadow: state.isFocused ? '0 0 0 1px #fff' : 'none',
        borderRadius: '8px',
        padding: '3px',
        '&:hover': { borderColor: '#DBEAFE' },
        minHeight: '2.8rem'
    }),

    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? '#ecebff' : state.isFocused ? '#ecebff' : 'white',
        color: state.isSelected ? '#465fff' : '#1F2937',
        cursor: 'pointer',
        borderRadius: '6px'
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
        padding: '4px',
        maxHeight: '150px',
        overflowY: 'auto'
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

const AsyncMultiSelect: React.FC<AsyncMultiSelectProps> = ({
    name,
    value,
    error,
    onChange,
    loadOptions,
    placeholder = 'لطفا انتخاب کنید',
    defaultOptions = true,
    isLoading,
    initialOptions = []
}) => {
    const id = useId();
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(
        initialOptions.filter((opt) => value.includes(opt.value))
    );

    const handleChange = (selected: readonly Option[]) => {
        const opts = selected as Option[];
        setSelectedOptions(opts);
        onChange(opts.map((opt) => opt.value));
    };

    return (
        <AsyncSelect
            instanceId={id}
            isMulti
            name={name}
            cacheOptions
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            value={selectedOptions}
            onChange={handleChange as any}
            isLoading={isLoading}
            placeholder={placeholder}
            classNamePrefix='react-select'
            noOptionsMessage={() => 'آیتمی یافت نشد!'}
            loadingMessage={() => 'در حال بارگذاری...'}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            styles={{
                ...customStyles,
                control: (base, state) => ({
                    ...customStyles.control(base, state),
                    borderColor: error ? '#f87171' : base.borderColor,
                    '&:hover': {
                        borderColor: error ? '#f87171' : base.borderColor
                    }
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 999999999
                })
            }}
        />
    );
};

export default AsyncMultiSelect;
