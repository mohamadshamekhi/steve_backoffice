export default interface InputProps {
    type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string;
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
    step?: number;
    disabled?: boolean;
    success?: boolean;
    error?: boolean;
    hint?: string;
    maxLength?: number;
    hintClass?: string;
    dir?: 'rtl' | 'ltr';
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    /** اجبار به ارقام انگلیسی؛ پیش‌فرض از روی type/inputMode تشخیص داده می‌شود */
    numeric?: boolean;
}
