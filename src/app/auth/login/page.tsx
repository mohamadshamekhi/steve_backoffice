import AuthLayout from 'libs/components/pages/auth/AuthLayout/AuthPageLayout';
import SignInForm from 'libs/components/pages/auth/SignInForm/SignInForm';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function Page() {
    return (
        <Suspense fallback={<></>}>
            <AuthLayout>
                <SignInForm />
            </AuthLayout>
        </Suspense>
    );
}

export default Page;
