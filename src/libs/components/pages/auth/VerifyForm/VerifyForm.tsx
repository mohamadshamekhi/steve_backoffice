'use client';

import { signInVerifyAction } from 'app/_actions/auth.actions';
import { useFormik } from 'formik';
import { VerifySignInModel } from 'libs/models';
import { Button } from 'libs/ui';
import { toEnglishDigits } from 'libs/utilities';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { otpSchema } from 'libs/validator/schemas';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import OTPInput from 'react-otp-input';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const VerifyForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = searchParams.get('phone_number');

    const [isPending, startTransition] = useTransition();

    const onSubmit = (values: VerifySignInModel) => {
        startTransition(async () => {
            try {
                const result = await signInVerifyAction({
                    phone_number: phoneNumber,
                    ...values
                });
                if (result?.success) {
                    toast.success(result.message);
                    router.push('/dashboard');
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
            code: ''
        },
        validationSchema: toFormikValidationSchema(otpSchema),
        onSubmit: onSubmit
    });

    return (
        <div className='flex flex-1 flex-col items-center justify-center px-2 md:px-4'>
            <div className='mx-auto flex w-full max-w-md flex-col justify-center px-2 sm:max-w-lg sm:px-6 md:max-w-xl'>
                <div className='mb-5 sm:mb-8'>
                    <h1 className='mb-2 text-lg font-semibold text-gray-800 sm:text-2xl dark:text-white/90'>
                        وارد شدن
                    </h1>
                    <p className='text-sm text-gray-500 sm:text-base dark:text-gray-400'>
                        برای وارد شدن لطفا کد ارسالی خود را وارد کنید.
                    </p>
                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className='space-y-6'>
                        <Fieldset name='code' touched={formik.touched} errors={formik.errors} className='w-full'>
                            <OTPInput
                                value={formik.values.code}
                                onChange={(val) => formik.setFieldValue('code', toEnglishDigits(val))}
                                numInputs={5}
                                renderSeparator={<span>-</span>}
                                shouldAutoFocus
                                containerStyle={{ direction: 'ltr', gap: '0.5rem', justifyContent: 'center' }}
                                renderInput={(props) => (
                                    <input
                                        {...props}
                                        style={{ direction: 'ltr' }}
                                        className='aspect-square max-w-[2rem] rounded-lg border border-gray-300 bg-indigo-50 text-center text-base transition-colors duration-200 outline-none focus:border-indigo-600 focus:bg-indigo-100 sm:max-w-[2rem] sm:text-sm md:max-w-[3rem]'
                                    />
                                )}
                            />
                        </Fieldset>

                        <Button className='w-full px-6' size='sm' type='submit' loading={isPending}>
                            مرحله بعد
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyForm;
