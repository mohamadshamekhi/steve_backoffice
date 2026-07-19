export type BadgeVariant = 'light' | 'solid';
export type BadgeSize = 'sm' | 'md';
export type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

export default interface BadgeProps {
    variant?: BadgeVariant; // Light or solid variant
    size?: BadgeSize; // Badge size
    color?: BadgeColor; // Badge color
    startIcon?: React.ReactNode; // Icon at the start
    endIcon?: React.ReactNode; // Icon at the end
    children: React.ReactNode; // Badge content,
    className?: string;
}
