import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const ChevronDownIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M4.79175 7.396L10.0001 12.6043L15.2084 7.396'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(ChevronDownIcon);
