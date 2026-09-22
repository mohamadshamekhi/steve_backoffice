const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** تبدیل ارقام فارسی/عربی به انگلیسی (و جداکننده‌ی اعشار عربی) */
export const toEnglishDigits = (value: string): string =>
    value
        .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
        .replace(/٫/g, '.')
        .replace(/،/g, ',');

export const hasNonEnglishDigits = (value: string): boolean => /[۰-۹٠-٩٫]/.test(value);
