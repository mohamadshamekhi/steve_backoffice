import AuthLayout from 'libs/components/pages/auth/AuthLayout/AuthPageLayout';
import VerifyForm from 'libs/components/pages/auth/VerifyForm/VerifyForm';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const page = () => {
    return (
        <Suspense fallback={<></>}>
            <AuthLayout>
                <VerifyForm />
            </AuthLayout>
        </Suspense>
    );
};

export default page;
