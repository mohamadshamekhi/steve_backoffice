import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const AlignCenterIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='20'
            height='14'
            viewBox='0 0 20 14'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M16 5H4M19 1H1M19 9H1M16 13H4'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(AlignCenterIcon);
