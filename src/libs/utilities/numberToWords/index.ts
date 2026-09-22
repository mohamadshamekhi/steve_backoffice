const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const dahgan = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const dahyek = [
    'ده',
    'یازده',
    'دوازده',
    'سیزده',
    'چهارده',
    'پانزده',
    'شانزده',
    'هفده',
    'هجده',
    'نوزده'
];
const sadgan = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

const threeDigitToWords = (n: number): string => {
    const parts: string[] = [];
    const s = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const y = n % 10;

    if (s) parts.push(sadgan[s]);

    if (d === 1) {
        parts.push(dahyek[y]);
    } else {
        if (d) parts.push(dahgan[d]);
        if (y) parts.push(yekan[y]);
    }

    return parts.join(' و ');
};

export const numberToPersianWords = (input: number): string => {
    const n = Math.floor(Math.abs(input));
    if (n === 0) return 'صفر';

    const groups: number[] = [];
    let rest = n;
    while (rest > 0) {
        groups.unshift(rest % 1000);
        rest = Math.floor(rest / 1000);
    }

    const words = groups
        .map((group, index) => {
            if (!group) return '';
            const scale = scales[groups.length - 1 - index];
            const groupWords = threeDigitToWords(group);
            return scale ? `${groupWords} ${scale}` : groupWords;
        })
        .filter(Boolean);

    return (input < 0 ? 'منفی ' : '') + words.join(' و ');
};

export const priceToWords = (price: number, unit = 'تومان'): string =>
    `${numberToPersianWords(price)} ${unit}`;
