'use client';
import { Button } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface QrLabelModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** متنی که داخل QR قرار می‌گیرد (اگر image داده نشود) */
    value?: string;
    /** تصویر آماده‌ی QR (data URI) — مثلاً QR تحویل سفارش که بک‌اند می‌سازد */
    image?: string;
    /** خط اصلی زیر QR */
    caption: string;
    /** خط دوم (اختیاری) */
    subCaption?: string;
    fileName?: string;
    loading?: boolean;
}

const QR_SIZE = 480;

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

// متن را در عرض مشخص می‌شکند تا اسم‌های طولانی از لیبل بیرون نزنند
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else line = next;
    }
    if (line) lines.push(line);
    return lines;
};

const QrLabelModal = ({ isOpen, onClose, value, image, caption, subCaption, fileName = 'qr-code', loading }: QrLabelModalProps) => {
    const [generated, setGenerated] = useState<string>('');
    const src = image || generated;

    useEffect(() => {
        if (!isOpen || image || !value) return;
        QRCode.toDataURL(value, { width: QR_SIZE, margin: 1, errorCorrectionLevel: 'M' })
            .then(setGenerated)
            .catch(() => setGenerated(''));
    }, [isOpen, value, image]);

    const download = async () => {
        if (!src) return;
        const qr = await loadImage(src);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const padding = 32;
        const width = QR_SIZE + padding * 2;
        const font = getComputedStyle(document.body).fontFamily;
        ctx.font = `bold 26px ${font}`;
        const captionLines = wrapText(ctx, caption, QR_SIZE);
        ctx.font = `20px ${font}`;
        const subLines = subCaption ? wrapText(ctx, subCaption, QR_SIZE) : [];
        const height = padding + QR_SIZE + 20 + captionLines.length * 36 + subLines.length * 30 + padding;

        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(qr, padding, padding, QR_SIZE, QR_SIZE);

        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        let y = padding + QR_SIZE + 20 + 26;
        ctx.font = `bold 26px ${font}`;
        captionLines.forEach((l) => {
            ctx.fillText(l, width / 2, y);
            y += 36;
        });
        ctx.fillStyle = '#555';
        ctx.font = `20px ${font}`;
        subLines.forEach((l) => {
            ctx.fillText(l, width / 2, y - 6);
            y += 30;
        });

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${fileName}.png`;
        a.click();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} containerClassName='max-w-[420px]'>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-qr-label, #printable-qr-label * { visibility: visible; }
                    #printable-qr-label { position: fixed; top: 0; left: 50%; transform: translateX(-50%); }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div
                id='printable-qr-label'
                dir='rtl'
                className='mx-auto mt-8 flex w-64 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-900'
            >
                {loading || !src ? (
                    <div className='aspect-square w-full animate-pulse rounded-lg bg-gray-100' aria-label='در حال ساخت QR' />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={`QR ${caption}`} className='aspect-square w-full' />
                )}
                <p className='text-sm leading-6 font-bold break-words'>{caption}</p>
                {subCaption && <p className='text-xs leading-5 break-words text-gray-600'>{subCaption}</p>}
            </div>

            <div className='no-print mt-6 flex items-center justify-end gap-2'>
                <Button variant='outline' size='sm' onClick={onClose}>
                    بستن
                </Button>
                <Button variant='outline' size='sm' onClick={download} disabled={!src}>
                    دانلود PNG
                </Button>
                <Button size='sm' onClick={() => window.print()} disabled={!src}>
                    چاپ لیبل
                </Button>
            </div>
        </Modal>
    );
};

export default QrLabelModal;
