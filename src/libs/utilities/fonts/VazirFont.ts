import localFont from 'next/font/local';

const VazirFont = localFont({
    src: [
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-Light.ttf',
            weight: '300',
            style: 'normal'
        },
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-Regular.ttf',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-Medium.ttf',
            weight: '500',
            style: 'normal'
        },
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-SemiBold.ttf',
            weight: '600',
            style: 'normal'
        },
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-Bold.ttf',
            weight: '700',
            style: 'normal'
        },
        {
            path: '../../../../public/fonts/vazirmatn/ttf/Vazirmatn-ExtraBold.ttf',
            weight: '800',
            style: 'normal'
        }
    ],
    display: 'swap',
    variable: '--font-Vazir'
});

export default VazirFont;
