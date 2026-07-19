import type { FC } from 'react';

const IconWrapper = (Component: FC) => {
    const Wrapped = ({ ...props }) => {
        return <Component {...props} />;
    };

    return Wrapped;
};

export default IconWrapper;
