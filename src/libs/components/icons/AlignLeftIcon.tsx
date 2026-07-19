import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const AlignLeftIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='19'
            height='14'
            viewBox='0 0 19 14'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M14 5H1M18 1H1M18 9H1M14 13H1'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(AlignLeftIcon);
