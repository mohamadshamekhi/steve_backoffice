'use client';

import { signInAction } from 'app/_actions/auth.actions';
import { useFormik } from 'formik';
import { SignInModel } from 'libs/models';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { loginSchema } from 'libs/validator/schemas';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const SignInForm: React.FC = () => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = (values: SignInModel) => {
        startTransition(async () => {
            try {
                const result = await signInAction(values);

                if (result?.success) {
                    toast.success(result.message);
                    router.push(`/auth/verify?phone_number=${values.phone_number}`);
                } else {
                    toast.error(result?.message || 'خطایی رخ داده است', { type: 'error' });
                }
            } catch (error) {
                toast.error('خطایی رخ داده است', { type: 'error' });
                console.log(error, 'error');
            }
        });
    };

    const formik = useFormik({
        initialValues: {
            phone_number: ''
        },
        validationSchema: toFormikValidationSchema(loginSchema),
        onSubmit: onSubmit
    });

    return (
        <div className='flex flex-1 flex-col'>
            <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
                <div>
                    <div className='mb-5 sm:mb-8'>
                        <h1 className='text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90'>
                            وارد شوید
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            برای وارد شدن لطفا شماره موبایل خود را وارد کنید.
                        </p>
                    </div>
                    <div>
                        <form onSubmit={formik.handleSubmit}>
                            <div className='space-y-6'>
                                <div>
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

                                <div>
                                    <Button className='w-full' size='sm' type='submit' loading={isPending}>
                                        مرحله بعد
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInForm;
