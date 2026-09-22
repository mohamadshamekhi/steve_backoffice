'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import VariantStockFields from 'libs/components/pages/product/variantStockFields';
import { StockMode } from 'libs/models/warehouse.model';
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
    stock_mode?: StockMode;
    allow_backorder?: boolean;
    backorder_limit?: number | null;
    supplier_id?: string;
    supply_cost?: number;
    avg_cost?: number;
}

type EditVariantProps = {
    id: string;
    onClose: () => void;
    onUpdated: () => void;
    mutate: () => void;
    isOpen: boolean;
    data: ActionCellProps;
    isService?: boolean;
};

type FormValues = {
    price: number;
    quantity: number;
    label: string;
    key: string;
    value: string;
    warranty: string;
    stock_mode: StockMode;
    allow_backorder: boolean;
    backorder_limit: string;
    supplier_id: string;
    supply_cost: number;
};

const EditVariant = ({ id, onUpdated, onClose, mutate, isOpen, data, isService = false }: EditVariantProps) => {
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
            warranty: data.warranty,
            stock_mode: (isService ? 'none' : (data.stock_mode ?? 'tracked')) as StockMode,
            allow_backorder: data.allow_backorder ?? false,
            backorder_limit:
                data.backorder_limit === null || data.backorder_limit === undefined
                    ? ''
                    : String(data.backorder_limit),
            supplier_id: data.supplier_id ?? '',
            supply_cost: data.supply_cost ?? 0
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
                        body: (() => {
                            const {
                                stock_mode,
                                allow_backorder,
                                backorder_limit,
                                supplier_id,
                                supply_cost,
                                ...rest
                            } = values;

                            return {
                                ...rest,
                                // Only a tracked variant carries a real quantity.
                                quantity: stock_mode === 'tracked' ? rest.quantity : 0,
                                stock_mode,
                                allow_backorder: stock_mode === 'tracked' ? allow_backorder : false,
                                backorder_limit:
                                    stock_mode === 'tracked' && allow_backorder && backorder_limit !== ''
                                        ? Number(backorder_limit)
                                        : null,
                                supplier_id,
                                supply_cost: Number(supply_cost || 0)
                            };
                        })()
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

                    {formik.values.stock_mode === 'tracked' && (
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
                    )}
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
                    <VariantStockFields
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                        isService={isService}
                        avgCost={data.avg_cost}
                    />
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
