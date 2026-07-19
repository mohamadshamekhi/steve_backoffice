export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchVariant = 'primary' | 'success' | 'secondary' | 'black' | 'gray';

interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: SwitchSize;
    variant?: SwitchVariant;
    disabled?: boolean;
    name?: string;
    id?: string;
}

export default SwitchProps;
