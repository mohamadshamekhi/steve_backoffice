import { useCallback, useState } from 'react';

export type useModalReturnType = {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
};

export type useModalProps = {
    /**
     * Initial state of the modal
     */
    initialState?: boolean;
};

export const useModal = ({ initialState = false }: useModalProps = {}): useModalReturnType => {
    const [isOpen, setIsOpen] = useState(initialState);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);
    const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, openModal, closeModal, toggleModal };
};
