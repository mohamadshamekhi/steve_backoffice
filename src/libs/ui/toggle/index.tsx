'use client';
import { cn } from 'libs/utilities';
import * as React from 'react';

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pressed?: boolean;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(({ className, pressed, ...props }, ref) => {
    return (
        <button
            type='button'
            className={cn(
                'inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors',
                pressed ? 'bg-gray-200 text-gray-600' : 'hover:bg-gray-100 hover:text-gray-500',
                className
            )}
            aria-pressed={pressed}
            onClick={props.onClick}
            ref={ref}
            {...props}
        >
            {props.children}
        </button>
    );
});

Toggle.displayName = 'Toggle';

export { Toggle };
