import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const ItalicIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='16'
            height='18'
            viewBox='0 0 16 18'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M15 1H6M10 17H1M11 1L5 17'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(ItalicIcon);
