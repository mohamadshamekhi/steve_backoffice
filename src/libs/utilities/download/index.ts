/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseCookies } from 'nookies';
import { stringify } from 'querystring';
import { toast } from 'react-toastify';

/**
 * دانلود خروجی CSV یک اندپوینت.
 *
 * اندپوینت‌های گزارش با `format=csv` به‌جای JSON فایل برمی‌گردانند، پس
 * `fetcher` (که همیشه `response.json()` می‌زند) اینجا قابل استفاده نیست.
 */
export const downloadCsv = async (path: string, params: Record<string, any> = {}, fileName = 'export') => {
    const token = parseCookies()['steve-session'];

    if (!token) {
        toast.error('دسترسی غیر مجاز');
        return false;
    }

    const query = stringify({ ...params, format: 'csv' });

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}?${query}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            toast.error('دریافت خروجی اکسل ناموفق بود');
            return false;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('csv download failed:', error);
        toast.error('خطا در ارتباط با سرور');
        return false;
    }
};
