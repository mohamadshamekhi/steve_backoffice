export interface DropdownProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export interface DropdownItemProps {
    tag?: 'a' | 'button';
    href?: string;
    onClick?: () => void;
    onItemClick?: () => void;
    baseClassName?: string;
    className?: string;
    children: React.ReactNode;
}
