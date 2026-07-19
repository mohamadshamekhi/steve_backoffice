import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'outline' | 'warning' | 'success' | 'danger' | 'secondary' | 'primary-text' | 'danger-text';
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    IconClass?: string;
}

export default ButtonProps;
