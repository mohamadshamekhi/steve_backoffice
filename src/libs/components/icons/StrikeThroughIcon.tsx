import IconProps from 'libs/models/icon.types';
import IconWrapper from '../common/IconWrapper/IconWrapper';

const StrikeThroughIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
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
                d='M2 5V4C2 3.45879 2.21497 2.96778 2.56419 2.60772M7 18H13M10 10V18M1 1L19 19M7.5 2H15C15.9319 2 16.3978 2 16.7654 2.15224C17.2554 2.35523 17.6448 2.74458 17.8478 3.23463C18 3.60218 18 4.06812 18 5M10 2V4.5'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(StrikeThroughIcon);
