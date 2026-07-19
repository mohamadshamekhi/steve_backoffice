import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const BoldIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='15'
            height='18'
            viewBox='0 0 15 18'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M1 9H9C11.2091 9 13 7.20914 13 5C13 2.79086 11.2091 1 9 1H1V9ZM1 9H10C12.2091 9 14 10.7909 14 13C14 15.2091 12.2091 17 10 17H1V9Z'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(BoldIcon);
