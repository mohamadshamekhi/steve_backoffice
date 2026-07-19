import { StaticImageData } from 'next/image';

export type EmptyStateProps = {
    title?: string;
    subtitle?: string;
    img?: StaticImageData;
    className?: string;
    imgClass?: string;
    titleClass?: string;
    subtitleClass?: string;
    loading?: boolean;
};
