/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useId } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Props as SelectProps } from 'react-select';

type Option = { label: string; value: string };

interface CreatableSelectInputProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value' | 'options'> {
    name: string;
    options: Option[];
    value: string;
    error?: boolean;
    onChange: (value: string) => void;
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

// options + value را با هم map می‌کند تا مقداری که هنوز در لیست options نیست هم به‌عنوان انتخاب‌شده نمایش داده شود
const resolveSelectedOption = (options: Option[], value: string): Option | null => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) || { label: value, value };
};

const CreatableSelectInput: React.FC<CreatableSelectInputProps> = ({
    name,
    options,
    value,
    error,
    onChange,
    ...props
}) => {
    const id = useId();
    const selectedOption = resolveSelectedOption(options, value);

    return (
        <CreatableSelect
            {...props}
            instanceId={id}
            name={name}
            value={selectedOption}
            onChange={(option) => onChange((option as Option)?.value || '')}
            options={options}
            classNamePrefix='react-select'
            placeholder='انتخاب یا وارد کنید'
            formatCreateLabel={(inputValue) => `افزودن «${inputValue}»`}
            noOptionsMessage={() => 'مقداری یافت نشد، تایپ کنید تا اضافه شود'}
            isClearable
            isRtl
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

export default CreatableSelectInput;
