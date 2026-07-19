import IconProps from 'libs/models/icon.types';
import IconWrapper from '../common/IconWrapper/IconWrapper';

const OrderIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='22'
            height='18'
            viewBox='0 0 22 18'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M8 14L11 17M11 17L14 14M11 17V10M21 6H1M4.5 15H4.2C3.0799 15 2.51984 15 2.09202 14.782C1.71569 14.5903 1.40973 14.2843 1.21799 13.908C1 13.4802 1 12.9201 1 11.8V4.2C1 3.0799 1 2.51984 1.21799 2.09202C1.40973 1.71569 1.7157 1.40973 2.09202 1.21799C2.51984 1 3.0799 1 4.2 1H17.8C18.9201 1 19.4802 1 19.908 1.21799C20.2843 1.40974 20.5903 1.7157 20.782 2.09202C21 2.51984 21 3.0799 21 4.2V11.8C21 12.9201 21 13.4802 20.782 13.908C20.5903 14.2843 20.2843 14.5903 19.908 14.782C19.4802 15 18.9201 15 17.8 15H17.5'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(OrderIcon);
