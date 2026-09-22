'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { ISupplier } from 'libs/models/warehouse.model';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { supplierValidationSchema } from 'libs/validator/schemas/warehouse.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
    supplier?: ISupplier | null;
}

const SupplierForm = ({ isOpen, onClose, mutate, supplier }: IProps) => {
    const [loading, setLoading] = useState(false);
    const isEdit = Boolean(supplier?.id);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: supplier?.name ?? '',
            shop_name: supplier?.shop_name ?? '',
            phone_number: supplier?.phone_number ?? '',
            address: supplier?.address ?? '',
            note: supplier?.note ?? '',
            is_active: supplier?.is_active ?? true
        },
        validationSchema: toFormikValidationSchema(supplierValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                if (isEdit && supplier) {
                    // PATCH is partial on the backend, so only changed fields are sent.
                    const changed = Object.fromEntries(
                        Object.entries(values).filter(
                            ([key, value]) => value !== (supplier as unknown as Record<string, unknown>)[key]
                        )
                    );

                    if (Object.keys(changed).length === 0) {
                        toast.info('تغییری برای ثبت وجود ندارد');
                        setLoading(false);
                        return;
                    }

                    const response = await fetcher(ApiKeys.PATCH_SUPPLIER(supplier.id), 'dashboard', 'PATCH', {
                        body: changed
                    });

                    if (response?.success) {
                        toast.success('تأمین‌کننده با موفقیت ویرایش شد');
                        mutate();
                        onClose();
                    }
                } else {
                    const response = await fetcher(ApiKeys.POST_SUPPLIER, 'dashboard', 'POST', {
                        body: {
                            name: values.name,
                            shop_name: values.shop_name,
                            phone_number: values.phone_number,
                            address: values.address,
                            note: values.note
                        }
                    });

                    if (response?.success) {
                        toast.success('تأمین‌کننده با موفقیت ثبت شد');
                        mutate();
                        onClose();
                    }
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>
                {isEdit ? 'ویرایش تأمین‌کننده' : 'افزودن تأمین‌کننده'}
            </h3>

            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:grid-cols-2 md:gap-3'>
                    <Fieldset
                        label='نام'
                        name='name'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <Input
                            name='name'
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.name && formik.errors.name)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='نام مغازه'
                        name='shop_name'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 md:col-span-1'
                    >
                        <Input
                            name='shop_name'
                            value={formik.values.shop_name}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.shop_name && formik.errors.shop_name)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='شماره تلفن'
                        name='phone_number'
                        touched={formik.touched}
                        errors={formik.errors}
                        hint='نمونه: 09121234567'
                        className='col-span-2 md:col-span-1'
                    >
                        <Input
                            name='phone_number'
                            dir='ltr'
                            value={formik.values.phone_number}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.phone_number && formik.errors.phone_number)}
                        />
                    </Fieldset>

                    {isEdit && (
                        <Fieldset
                            label='وضعیت (فعال)'
                            name='is_active'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 md:col-span-1'
                        >
                            <Switch
                                name='is_active'
                                checked={formik.values.is_active}
                                onChange={(checked) => formik.setFieldValue('is_active', checked)}
                                size='md'
                                variant='primary'
                            />
                        </Fieldset>
                    )}

                    <Fieldset
                        label='آدرس'
                        name='address'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2'
                    >
                        <textarea
                            name='address'
                            rows={2}
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            className='focus:border-brand-300 focus:ring-brand-500/20 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90'
                        />
                    </Fieldset>

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
                        {isEdit ? 'ثبت تغییرات' : 'افزودن'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SupplierForm;
