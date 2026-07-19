'use client';

import Image from 'next/image';
import img from '../../../public/images/placeholder/welcome.png';

const Dashboard: React.FC = () => {
    return (
        <section className='flex min-h-[400px] flex-col items-center justify-center space-y-3'>
            <Image src={img} alt='welcome' width={400} height={400} className='aspect-square' />
            <h1 className='text-center text-xl font-semibold'>به استیو خوش آمدید</h1>
        </section>
    );
};

export default Dashboard;
