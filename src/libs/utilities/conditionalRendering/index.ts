import React from 'react';

interface IProps {
    children: React.ReactNode;
}

interface ICaseProps {
    condition: boolean;
    children: React.ReactNode;
}

function Switch({ children }: IProps) {
    let matchChild: React.ReactNode = null;
    let defaultCase: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            if (!matchChild && child.type === Case) {
                const { condition } = child.props as ICaseProps;
                const conditionResult = Boolean(condition);
                if (conditionResult) {
                    matchChild = child;
                }
            } else if (!defaultCase && child.type === Default) {
                defaultCase = child;
            }
        }
    });

    return matchChild ?? defaultCase ?? null;
}

const Case = ({ children }: ICaseProps) => {
    return children;
};

const Default = ({ children }: IProps) => {
    return children;
};

export { Case, Default, Switch };
