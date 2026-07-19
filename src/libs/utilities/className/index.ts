import { ClassValue, clsx } from 'clsx';
import { twMerge as twMergeOriginal } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
    return twMergeOriginal(clsx(inputs));
};

export { cn };
