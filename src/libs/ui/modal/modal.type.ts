interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    /** کلاس باکس بیرونی؛ برای تغییر عرض مودال (پیش‌فرض max-w-[700px]) */
    containerClassName?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    isFullscreen?: boolean;
}
export default ModalProps;
