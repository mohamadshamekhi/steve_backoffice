'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { userSchema } from 'libs/validator/schemas/user.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

type User = {
    id: string;
    _id: string;
    name: string;
    phone_number: string;
    created_at: string;
};

interface ActionCellProps {
    data: User;
    onClose: () => void;
    isOpen: boolean;
    onUpdated: () => void;
}

const Edit = ({ onClose, data, onUpdated, isOpen }: ActionCellProps) => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            name: data.name,
            phone_number: data.phone_number
        },
        validationSchema: toFormikValidationSchema(userSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.PATCH_USER(data._id), 'dashboard', 'PATCH', {
                    body: {
                        ...values,
                        user_id: data._id
                    }
                });

                if (status !== 400) {
                    onUpdated();
                    toast.success(' کاربر با موفقیت ویرایش شد');
                    router.push('/dashboard/users');
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
            <form onSubmit={formik.handleSubmit}>
                <div className='space-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='نام'
                        name='name'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='w-full md:col-span-1'
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
                        label='شماره همراه'
                        name='phone_number'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='w-full'
                        hint='لطفا شماره همراه را با اعداد انگلیسی وارد کنید'
                    >
                        <Input
                            name='phone_number'
                            type='text'
                            maxLength={11}
                            placeholder='0911*******'
                            error={Boolean(formik.touched.phone_number && formik.errors.phone_number)}
                            onChange={formik.handleChange}
                            value={formik.values.phone_number}
                            inputMode='numeric'
                            dir='ltr'
                        />
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button disabled={loading} size='sm' type='button' variant='outline' onClick={onClose}>
                        لغو
                    </Button>

                    <Button disabled={loading} loading={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default Edit;
