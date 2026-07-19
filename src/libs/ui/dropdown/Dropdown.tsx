'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { DropdownItemProps, DropdownProps } from './Dropdown.types';

export const Dropdown: React.FC<DropdownProps> & {
    Item: React.FC<DropdownItemProps>;
} = ({ isOpen, onClose, children, className = '' }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.dropdown-toggle')
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className={`shadow-theme-lg dark:bg-gray-dark absolute left-0 z-40 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 ${className}`}
        >
            {children}
        </div>
    );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
    tag = 'button',
    href,
    onClick,
    onItemClick,
    baseClassName = 'block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    className = '',
    children,
    ...rest
}) => {
    const combinedClasses = `${baseClassName} ${className}`.trim();

    const handleClick = (event: React.MouseEvent) => {
        if (tag === 'button') {
            event.preventDefault();
        }
        if (onClick) onClick();
        if (onItemClick) onItemClick();
    };

    if (tag === 'a' && href) {
        return (
            <Link href={href} className={combinedClasses} onClick={handleClick}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={handleClick} className={combinedClasses} {...rest}>
            {children}
        </button>
    );
};

Dropdown.Item = DropdownItem;
