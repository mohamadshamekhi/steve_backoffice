'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import SupplierSelect from 'libs/components/pages/supplier/select';
import {
    EXPENSE_CATEGORY_OPTIONS,
    PAYMENT_METHOD_OPTIONS
} from 'libs/constants/accounting/accounting.constants';
import { toIsoDate } from 'libs/constants/warehouse/warehouse.constants';
import { ExpenseCategory, IExpense, PaymentMethod } from 'libs/models/accounting.model';
import { Button, CSelect, DatePicker, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { expenseValidationSchema } from 'libs/validator/schemas/accounting.schema';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
    expense?: IExpense | null;
}

const ExpenseForm = ({ isOpen, onClose, mutate, expense }: IProps) => {
    const [loading, setLoading] = useState(false);
    const isEdit = Boolean(expense?.id);

    const [spentAt, setSpentAt] = useState<DateObject | null>(
        expense?.spent_at ? new DateObject(new Date(expense.spent_at)) : new DateObject(new Date())
    );

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: expense?.title ?? '',
            category: (expense?.category ?? 'other') as ExpenseCategory,
            amount: expense?.amount ? String(expense.amount) : '',
            supplier_id: expense?.supplier_id ?? '',
            payment_method: (expense?.payment_method ?? 'cash') as PaymentMethod,
            is_paid: expense?.is_paid ?? true,
            spent_at: expense?.spent_at ? toIsoDate(expense.spent_at) : toIsoDate(new Date()),
            note: expense?.note ?? ''
        },
        validationSchema: toFormikValidationSchema(expenseValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);

            // هزینه‌ی پرداخت‌نشده روش پرداخت ندارد؛ تراکنش صندوق هم برایش ثبت نمی‌شود.
            const payload = {
                title: values.title,
                category: values.category,
                amount: Number(values.amount || 0),
                is_paid: values.is_paid,
                ...(values.is_paid && { payment_method: values.payment_method }),
                ...(values.supplier_id && { supplier_id: values.supplier_id }),
                ...(values.spent_at && { spent_at: values.spent_at }),
                ...(values.note && { note: values.note })
            };

            try {
                const response = isEdit
                    ? await fetcher(ApiKeys.PATCH_EXPENSE(expense!.id), 'dashboard', 'PATCH', { body: payload })
                    : await fetcher(ApiKeys.POST_EXPENSE, 'dashboard', 'POST', { body: payload });

                if (response?.success) {
                    toast.success(isEdit ? 'هزینه ویرایش شد' : 'هزینه ثبت شد');
                    mutate();
                    onClose();
                }
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>
                {isEdit ? 'ویرایش هزینه' : 'ثبت هزینه'}
            </h3>

            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:grid-cols-2 md:gap-3'>
                    <Fieldset
                        label='عنوان'
                        name='title'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <Input
                            name='title'
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.title && formik.errors.title)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='دسته‌بندی'
                        name='category'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <CSelect
                            name='category'
                            options={EXPENSE_CATEGORY_OPTIONS}
                            value={formik.values.category}
                            onChange={(value) => formik.setFieldValue('category', value)}
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
                        label='تاریخ هزینه'
                        name='spent_at'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <DatePicker
                            name='spent_at'
                            value={spentAt ?? undefined}
                            onChange={(value) => {
                                setSpentAt(value);
                                formik.setFieldValue('spent_at', value ? toIsoDate(value.toDate()) : '');
                            }}
                        />
                    </Fieldset>

                    <Fieldset
                        label='تأمین‌کننده (اختیاری)'
                        name='supplier_id'
                        touched={formik.touched}
                        errors={formik.errors}
                        hint='اگر هزینه به یکی از تأمین‌کننده‌ها مربوط است انتخاب کنید'
                        className='col-span-2 md:col-span-1'
                    >
                        <SupplierSelect
                            value={formik.values.supplier_id}
                            onChange={(value) => formik.setFieldValue('supplier_id', value)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='پرداخت شده است'
                        name='is_paid'
                        touched={formik.touched}
                        errors={formik.errors}
                        hint='اگر خاموش باشد فقط ثبت می‌شود و از صندوق کم نمی‌شود'
                        className='col-span-2 md:col-span-1'
                    >
                        <Switch
                            name='is_paid'
                            checked={formik.values.is_paid}
                            onChange={(checked) => formik.setFieldValue('is_paid', checked)}
                            size='md'
                            variant='primary'
                        />
                    </Fieldset>

                    {formik.values.is_paid && (
                        <Fieldset
                            label='روش پرداخت'
                            name='payment_method'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 md:col-span-1'
                        >
                            <CSelect
                                name='payment_method'
                                options={PAYMENT_METHOD_OPTIONS}
                                value={formik.values.payment_method}
                                onChange={(value) => formik.setFieldValue('payment_method', value)}
                            />
                        </Fieldset>
                    )}

                    <Fieldset
                        label='یادداشت'
                        name='note'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2'
                    >
                        <textarea
                            name='note'
                            rows={2}
                            value={formik.values.note}
                            onChange={formik.handleChange}
                            className='focus:border-brand-300 focus:ring-brand-500/20 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90'
                        />
                    </Fieldset>
                </div>

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button variant='outline' size='sm' onClick={onClose} type='button'>
                        انصراف
                    </Button>
                    <Button loading={loading} disabled={loading} size='sm' type='submit'>
                        {isEdit ? 'ثبت تغییرات' : 'ثبت هزینه'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExpenseForm;
