import IconProps from 'libs/models/icon.types';
import IconWrapper from '../common/IconWrapper/IconWrapper';

const HighLightIcon = ({ className, stroke = 'currentColor', fill = 'none', strokeWidth = '1.5' }: IconProps) => {
    return (
        <svg
            className={className}
            width='22'
            height='22'
            viewBox='0 0 22 22'
            fill={fill}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M7.99997 10.2224L11.7778 14.0002M6.97485 19.975C5.60801 21.3419 3 21.0002 1 21.0002C2.0251 19.0002 0.658265 16.3921 2.0251 15.0253C3.39194 13.6585 5.60801 13.6585 6.97485 15.0253C8.34168 16.3921 8.34168 18.6082 6.97485 19.975ZM10.9216 14.9248L20.0587 5.05671C20.8635 4.18755 20.8375 2.83776 19.9999 2.00017C19.1624 1.16258 17.8126 1.13663 16.9434 1.94141L7.07534 11.0785C6.5654 11.5507 6.31043 11.7868 6.16173 12.0385C5.80514 12.6423 5.79079 13.3887 6.12391 14.0057C6.26283 14.2631 6.50853 14.5088 6.99995 15.0002C7.49136 15.4916 7.73707 15.7373 7.99438 15.8762C8.6114 16.2093 9.35781 16.195 9.96157 15.8384C10.2134 15.6897 10.4494 15.4347 10.9216 14.9248Z'
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default IconWrapper(HighLightIcon);
