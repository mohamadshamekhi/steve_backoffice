'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { CASH_DIRECTION_OPTIONS, PAYMENT_METHOD_OPTIONS } from 'libs/constants/accounting/accounting.constants';
import { toIsoDate } from 'libs/constants/warehouse/warehouse.constants';
import { CashDirection, PaymentMethod } from 'libs/models/accounting.model';
import { Button, CSelect, DatePicker, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { cashTransactionValidationSchema } from 'libs/validator/schemas/accounting.schema';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
}

const CashForm = ({ isOpen, onClose, mutate }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [occurredAt, setOccurredAt] = useState<DateObject | null>(new DateObject(new Date()));

    const formik = useFormik({
        initialValues: {
            direction: 'in' as CashDirection,
            method: 'cash' as PaymentMethod,
            amount: '',
            description: '',
            occurred_at: toIsoDate(new Date())
        },
        validationSchema: toFormikValidationSchema(cashTransactionValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await fetcher(ApiKeys.POST_CASH, 'dashboard', 'POST', {
                    body: {
                        direction: values.direction,
                        method: values.method,
                        amount: Number(values.amount || 0),
                        ...(values.description && { description: values.description }),
                        ...(values.occurred_at && { occurred_at: values.occurred_at })
                    }
                });

                if (response?.success) {
                    toast.success('تراکنش صندوق ثبت شد');
                    mutate();
                    onClose();
                }
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[600px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>ثبت تراکنش صندوق</h3>
            <p className='mt-1 text-xs text-gray-400'>
                تراکنش‌های سفارش، خرید، هزینه و مرجوعی خودکار ثبت می‌شوند؛ این فرم فقط برای موارد دستی است.
            </p>

            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:grid-cols-2 md:gap-3'>
                    <Fieldset
                        label='نوع تراکنش'
                        name='direction'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <CSelect
                            name='direction'
                            options={CASH_DIRECTION_OPTIONS}
                            value={formik.values.direction}
                            onChange={(value) => formik.setFieldValue('direction', value)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='روش پرداخت'
                        name='method'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <CSelect
                            name='method'
                            options={PAYMENT_METHOD_OPTIONS}
                            value={formik.values.method}
                            onChange={(value) => formik.setFieldValue('method', value)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='مبلغ (تومان)'
                        name='amount'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <Input
                            name='amount'
                            numeric
                            inputMode='numeric'
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.amount && formik.errors.amount)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='تاریخ'
                        name='occurred_at'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <DatePicker
                            name='occurred_at'
                            value={occurredAt ?? undefined}
                            onChange={(value) => {
                                setOccurredAt(value);
                                formik.setFieldValue('occurred_at', value ? toIsoDate(value.toDate()) : '');
                            }}
                        />
                    </Fieldset>

                    <Fieldset
                        label='توضیح'
                        name='description'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2'
                    >
                        <Input
                            name='description'
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.description && formik.errors.description)}
                        />
                    </Fieldset>
                </div>

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button variant='outline' size='sm' onClick={onClose} type='button'>
                        انصراف
                    </Button>
                    <Button loading={loading} disabled={loading} size='sm' type='submit'>
                        ثبت تراکنش
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CashForm;
