'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { ProductVariantSchema } from 'libs/validator/schemas/product.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface VariantAttribute {
    label: string;
    key: string;
    value: string;
}

interface ActionCellProps {
    id: string;
    price: number;
    quantity: number;
    warranty: string;
    variant_attribute: VariantAttribute[];
}

type EditVariantProps = {
    id: string;
    onClose: () => void;
    onUpdated: () => void;
    mutate: () => void;
    isOpen: boolean;
    data: ActionCellProps;
};

type FormValues = {
    price: number;
    quantity: number;
    label: string;
    key: string;
    value: string;
    warranty: string;
};

const EditVariant = ({ id, onUpdated, onClose, mutate, isOpen, data }: EditVariantProps) => {
    const [loading, setLoading] = useState(false);

    const initialVariantAttribute = data.variant_attribute?.[0] ?? {
        Label: '',
        Key: '',
        Value: ''
    };

    const formik = useFormik<FormValues>({
        initialValues: {
            price: data.price,
            quantity: data.quantity,
            label: initialVariantAttribute.label,
            key: initialVariantAttribute.key,
            value: initialVariantAttribute.value,
            warranty: data.warranty
        },
        validationSchema: toFormikValidationSchema(ProductVariantSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(
                    ApiKeys.PATCH_PRODUCT_UPDATE_VARIANT(id, data.id),
                    'dashboard',
                    'PATCH',
                    {
                        body: {
                            ...values
                        }
                    }
                );

                if (status !== 400) {
                    toast.success('نوع محصول با موفقیت ویرایش شد');
                    onClose();
                    mutate();
                    onUpdated();
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='شناسه'
                        name='key'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='key'
                            type='text'
                            error={Boolean(formik.touched.key && formik.errors.key)}
                            onChange={formik.handleChange}
                            value={formik.values.key}
                        />
                    </Fieldset>

                    <Fieldset
                        label='تعداد'
                        name='quantity'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='quantity'
                            type='number'
                            error={Boolean(formik.touched.quantity && formik.errors.quantity)}
                            onChange={formik.handleChange}
                            value={formik.values.quantity}
                            inputMode='numeric'
                            min='0'
                        />
                    </Fieldset>
                    <Fieldset
                        label='برچسب'
                        name='label'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='label'
                            type='text'
                            error={Boolean(formik.touched.label && formik.errors.label)}
                            onChange={formik.handleChange}
                            value={formik.values.label}
                        />
                    </Fieldset>
                    <Fieldset
                        label='مقدار شناسه'
                        name='value'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='value'
                            type='color'
                            error={Boolean(formik.touched.value && formik.errors.value)}
                            onChange={formik.handleChange}
                            value={formik.values.value}
                        />
                    </Fieldset>
                    <Fieldset
                        label='گارانتی'
                        name='warranty'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='warranty'
                            type='text'
                            error={Boolean(formik.touched.warranty && formik.errors.warranty)}
                            onChange={formik.handleChange}
                            value={formik.values.warranty}
                        />
                    </Fieldset>
                    <Fieldset
                        label='قیمت'
                        name='price'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='price'
                            type='number'
                            min='0'
                            error={Boolean(formik.touched.price && formik.errors.price)}
                            onChange={formik.handleChange}
                            value={formik.values.price}
                            inputMode='numeric'
                            hint='لطفا قیمت را به تومان وارد نمایید'
                        />
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button disabled={loading} loading={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditVariant;
