import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    placeholder?: string;
    hintClass?: string;
    hint?: string;
    error?: boolean;
}

export default TextareaProps;
