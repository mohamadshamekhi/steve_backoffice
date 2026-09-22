'use client';

import { toIsoDate } from 'libs/constants/warehouse/warehouse.constants';
import { Button, DatePicker } from 'libs/ui';
import { downloadCsv } from 'libs/utilities';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';

export const StatCard = ({
    label,
    value,
    hint,
    valueClass = ''
}: {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    valueClass?: string;
}) => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-white ${valueClass}`}>{value}</p>
        {hint && <p className='mt-1 text-xs text-gray-400'>{hint}</p>}
    </div>
);

const startOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

/** بازه‌ی تاریخ گزارش؛ پیش‌فرض از اول ماه جاری تا امروز. */
export const useDateRange = (withDefault = true) => {
    const [from, setFrom] = useState<DateObject | null>(withDefault ? new DateObject(startOfMonth()) : null);
    const [to, setTo] = useState<DateObject | null>(withDefault ? new DateObject(new Date()) : null);

    const fromDate = from ? toIsoDate(from.toDate()) : '';
    const toDate = to ? toIsoDate(to.toDate()) : '';

    return { from, to, setFrom, setTo, fromDate, toDate };
};

export const DateRangeFilter = ({
    from,
    to,
    setFrom,
    setTo
}: {
    from: DateObject | null;
    to: DateObject | null;
    setFrom: (value: DateObject | null) => void;
    setTo: (value: DateObject | null) => void;
}) => (
    <>
        <div className='w-full md:w-44'>
            <label className='mb-1 block text-xs text-gray-400'>از تاریخ</label>
            <DatePicker name='from' value={from ?? undefined} onChange={setFrom} />
        </div>
        <div className='w-full md:w-44'>
            <label className='mb-1 block text-xs text-gray-400'>تا تاریخ</label>
            <DatePicker name='to' value={to ?? undefined} onChange={setTo} />
        </div>
    </>
);

export const ExportButton = ({
    path,
    params,
    fileName
}: {
    path: string;
    params: Record<string, unknown>;
    fileName: string;
}) => {
    const [loading, setLoading] = useState(false);

    return (
        <Button
            size='sm'
            variant='outline'
            loading={loading}
            onClick={async () => {
                setLoading(true);
                try {
                    await downloadCsv(path, params, fileName);
                } finally {
                    setLoading(false);
                }
            }}
        >
            خروجی اکسل
        </Button>
    );
};
