/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useId } from 'react';
import Select, { Props as SelectProps } from 'react-select';

type Option = { label: string; value: string };

interface MultiSelectInputProps extends Omit<SelectProps<Option, true>, 'onChange' | 'value' | 'options'> {
    name: string;
    options: Option[];
    value: string[];
    error?: boolean;
    onChange: (values: string[]) => void;
}

const customStyles = {
    indicatorSeparator: () => ({ display: 'none' }),

    control: (base: any, state: any) => ({
        ...base,
        backgroundColor: '#fff',
        borderColor: state.isFocused ? '#d0d5dd' : '#d0d5dd',
        boxShadow: state.isFocused ? '0 0 0 1px #fff' : 'none',
        borderRadius: '6px',
        padding: '3px',
        '&:hover': { borderColor: '#DBEAFE' },
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
        padding: '4px',
        maxHeight: '150px',
        overflowY: 'auto',
        zIndex: '40000000000'
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

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({ name, options, value, error, onChange, ...props }) => {
    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const id = useId();

    return (
        <Select
            {...props}
            instanceId={id}
            isMulti
            name={name}
            value={selectedOptions}
            onChange={(selected) => onChange((selected as Option[]).map((opt) => opt.value))}
            options={options}
            classNamePrefix='react-select'
            noOptionsMessage={() => 'آیتمی یافت نشد!'}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            styles={{
                ...customStyles,
                control: (base, state) => ({
                    ...customStyles.control(base, state),
                    borderColor: error ? '#f87171' : base.borderColor,
                    '&:hover': {
                        borderColor: error ? '#f87171' : base.borderColor
                    },
                    minHeight: '2.8rem',
                    borderRadius: '8px'
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 999999999
                })
            }}
        />
    );
};

export default MultiSelectInput;
