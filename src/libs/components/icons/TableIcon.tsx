import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const TableIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect
                x='3'
                y='3'
                width='18'
                height='18'
                rx='2'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M3 9h18M3 15h18M9 3v18M15 3v18'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(TableIcon);
