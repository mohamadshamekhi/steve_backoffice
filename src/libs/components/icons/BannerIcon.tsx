import IconWrapper from 'libs/components/common/IconWrapper/IconWrapper';
import IconProps from 'libs/models/icon.types';

const BannerIcon = ({ className, fill = 'currentColor' }: IconProps) => {
    return (
        <svg
            className={className}
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3.25 6C3.25 4.48122 4.48122 3.25 6 3.25H18C19.5188 3.25 20.75 4.48122 20.75 6V14C20.75 15.5188 19.5188 16.75 18 16.75H6C4.48122 16.75 3.25 15.5188 3.25 14V6ZM6 4.75C5.30964 4.75 4.75 5.30964 4.75 6V14C4.75 14.6904 5.30964 15.25 6 15.25H18C18.6904 15.25 19.25 14.6904 19.25 14V6C19.25 5.30964 18.6904 4.75 18 4.75H6Z'
                fill={fill}
            />
            <path
                d='M7 8C7 7.58579 7.33579 7.25 7.75 7.25H16.25C16.6642 7.25 17 7.58579 17 8C17 8.41421 16.6642 8.75 16.25 8.75H7.75C7.33579 8.75 7 8.41421 7 8Z'
                fill={fill}
            />
            <path
                d='M7 12C7 11.5858 7.33579 11.25 7.75 11.25H12.25C12.6642 11.25 13 11.5858 13 12C13 12.4142 12.6642 12.75 12.25 12.75H7.75C7.33579 12.75 7 12.4142 7 12Z'
                fill={fill}
            />
            <path
                d='M6.75 18.25C6.33579 18.25 6 18.5858 6 19C6 19.4142 6.33579 19.75 6.75 19.75H17.25C17.6642 19.75 18 19.4142 18 19C18 18.5858 17.6642 18.25 17.25 18.25H6.75Z'
                fill={fill}
            />
        </svg>
    );
};

export default IconWrapper(BannerIcon);
