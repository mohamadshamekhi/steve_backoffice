/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import LoadingState from 'libs/ui/loadingState';
import { Modal } from 'libs/ui/modal';
import { shippingValidationSchema } from 'libs/validator/schemas/shipping.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface ShippingEditFormValues {
    name: string;
    description: string;
    cost: string;
    is_active: boolean;
}

interface EditProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const Edit = ({ id, onClose, onUpdated, isOpen }: EditProps) => {
    const [loading, setLoading] = useState<boolean>(false);

    const { isLoading: detailLoading, data: detail } = useSWR(
        isOpen ? ApiKeys.GET_SHIPPING(id) : null,
        (url: string) => fetcher(url, 'dashboard', 'GET'),
        { revalidateOnFocus: false }
    );

    const shipping = detail?.data?.shipping;

    const formik = useFormik<ShippingEditFormValues>({
        enableReinitialize: true,
        initialValues: {
            name: (shipping?.name as string) ?? '',
            description: (shipping?.description as string) ?? '',
            cost: shipping?.cost != null ? String(shipping.cost) : '',
            is_active: (shipping?.is_active as boolean) ?? true
        },
        validationSchema: toFormikValidationSchema(shippingValidationSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const body: Record<string, unknown> = {
                    name: values.name,
                    description: values.description,
                    is_active: values.is_active
                };

                // only send cost when it's a valid number (avoid sending null/NaN)
                const parsedCost = Number(String(values.cost).trim());
                if (String(values.cost).trim() !== '' && Number.isFinite(parsedCost)) {
                    body.cost = parsedCost;
                }

                const { status } = await fetcher(ApiKeys.PATCH_SHIPPING(id), 'dashboard', 'PATCH', {
                    body
                });
                if (status !== 400) {
                    onUpdated();
                    toast.success('نحوه ارسال با موفقیت ویرایش شد');
                    onClose();
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            {detailLoading ? (
                <div className='flex min-h-[200px] items-center justify-center'>
                    <LoadingState />
                </div>
            ) : (
                <form onSubmit={formik.handleSubmit}>
                    <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                        <Fieldset
                            label='نام'
                            name='name'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='w-full'
                        >
                            <Input
                                name='name'
                                type='text'
                                error={Boolean(formik.touched.name && formik.errors.name)}
                                onChange={formik.handleChange}
                                value={formik.values.name}
                            />
                        </Fieldset>

                        <Fieldset
                            label='هزینه'
                            name='cost'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='w-full'
                        >
                            <Input
                                name='cost'
                                type='text'
                                error={Boolean(formik.touched.cost && formik.errors.cost)}
                                onChange={formik.handleChange}
                                value={formik.values.cost}
                                hint='هزینه را با اعداد انگلیسی وارد کنید'
                            />
                        </Fieldset>

                        <Fieldset
                            label='توضیحات'
                            name='description'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 w-full'
                        >
                            <TextArea
                                name='description'
                                error={Boolean(formik.touched.description && formik.errors.description)}
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />
                        </Fieldset>

                        <Fieldset
                            label='فعال'
                            name='is_active'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 w-full md:col-span-1'
                        >
                            <Switch
                                size='md'
                                variant='primary'
                                name='is_active'
                                checked={formik.values.is_active}
                                onChange={(checked) => formik.setFieldValue('is_active', checked)}
                            />
                        </Fieldset>
                    </div>

                    <div className='mt-5 flex items-center justify-end gap-2'>
                        <Button disabled={loading} size='sm' type='button' variant='outline' onClick={onClose}>
                            لغو
                        </Button>
                        <Button loading={loading} disabled={loading} size='sm' type='submit'>
                            ثبت تغییرات
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default Edit;
