import { cn, hasNonEnglishDigits, toEnglishDigits } from 'libs/utilities';
import type { ChangeEvent, ClipboardEvent, FC, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import InputProps from './input.types';

const NON_ENGLISH_DIGIT_KEY = /^[۰-۹٠-٩٫]$/;

/** مقدار را روی اینپوت ست می‌کند و رویداد input بومی می‌فرستد تا React/Formik خبردار شوند */
const setNativeValue = (element: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
};

/** درج متن در محل کرسر؛ اگر اینپوت selection نداشت (مثل type=number) جایگزین کل مقدار می‌شود */
const insertAtCursor = (element: HTMLInputElement, text: string) => {
    let start: number | null = null;
    let end: number | null = null;

    try {
        start = element.selectionStart;
        end = element.selectionEnd;
    } catch {
        start = null;
    }

    if (start === null || end === null) {
        setNativeValue(element, `${element.value}${text}`);
        return;
    }

    const current = element.value;
    setNativeValue(element, `${current.slice(0, start)}${text}${current.slice(end)}`);

    const caret = start + text.length;
    try {
        element.setSelectionRange(caret, caret);
    } catch {
        // بعضی تایپ‌های اینپوت از setSelectionRange پشتیبانی نمی‌کنند
    }
};

const Input: FC<InputProps> = ({
    type = 'text',
    id,
    name,
    placeholder,
    value,
    onChange,
    onKeyDown,
    onPaste,
    className = '',
    min,
    max,
    step,
    disabled = false,
    error = false,
    hint,
    maxLength,
    hintClass = '',
    dir = 'rtl',
    numeric,
    ...rest
}) => {
    const inputMode = (rest as { inputMode?: string }).inputMode;
    const isNumeric =
        numeric ??
        (type === 'number' ||
            type === 'tel' ||
            inputMode === 'numeric' ||
            inputMode === 'decimal' ||
            inputMode === 'tel');

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (isNumeric && NON_ENGLISH_DIGIT_KEY.test(e.key)) {
                e.preventDefault();
                insertAtCursor(e.currentTarget, toEnglishDigits(e.key));
                return;
            }
            onKeyDown?.(e);
        },
        [isNumeric, onKeyDown]
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent<HTMLInputElement>) => {
            if (isNumeric) {
                const pasted = e.clipboardData.getData('text');
                if (hasNonEnglishDigits(pasted)) {
                    e.preventDefault();
                    insertAtCursor(e.currentTarget, toEnglishDigits(pasted));
                    return;
                }
            }
            onPaste?.(e);
        },
        [isNumeric, onPaste]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (isNumeric && hasNonEnglishDigits(e.target.value)) {
                e.target.value = toEnglishDigits(e.target.value);
            }
            onChange?.(e);
        },
        [isNumeric, onChange]
    );

    return (
        <>
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                dir={dir}
                className={cn(
                    'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800ß h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                    disabled
                        ? 'focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 border-gray-300 bg-transparent text-gray-800 dark:border-gray-700 dark:text-white/90'
                        : '',
                    error
                        ? 'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800'
                        : '',
                    className
                )}
                maxLength={maxLength}
                {...rest}
            />

            {hint && <p className={`mt-1.5 text-xs ${hintClass}`}>{hint}</p>}
        </>
    );
};

export default Input;
