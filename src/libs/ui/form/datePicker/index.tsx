/* eslint-disable react/jsx-key */
'use client';

import { useEffect, useState } from 'react';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePicker, { DateObject, Value } from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';

type PersianDatePickerProps = {
    name: string;
    value?: Value;
    onChange?: (value: DateObject | null) => void;
    className?: string;
    calendarPosition?: string;
    showTime?: boolean;
    placeholder?: string;
};

const PersianDatePicker = ({
    name,
    value: propValue,
    onChange,
    className,
    calendarPosition = 'bottom-right',
    showTime = false,
    placeholder
}: PersianDatePickerProps) => {
    const [internalValue, setInternalValue] = useState<Value | undefined>(propValue);

    useEffect(() => {
        if (propValue !== undefined) setInternalValue(propValue);
    }, [propValue]);

    const handleChange = (val: Value) => {
        setInternalValue(val);

        if (val && typeof val === 'object' && 'format' in val) {
            onChange?.(val as DateObject);
        } else {
            onChange?.(null);
        }
    };

    return (
        <DatePicker
            name={name}
            value={internalValue}
            onChange={handleChange}
            calendar={persian}
            locale={persian_fa}
            format={showTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'}
            calendarPosition={calendarPosition}
            placeholder={placeholder}
            inputClass={`h-11 text-sm px-2 rounded-lg border border-gray-300 w-full ${className || ''}`}
            plugins={showTime ? [<TimePicker position='bottom' hideSeconds />] : []}
        />
    );
};

export default PersianDatePicker;
