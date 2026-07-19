interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    isFullscreen?: boolean;
}
export default ModalProps;
