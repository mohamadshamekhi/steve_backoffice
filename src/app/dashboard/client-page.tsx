import React from 'react';

interface IProps {
    components: React.ReactNode;
}

function ClientPage({ components }: IProps) {
    return <>{components}</>;
}

export default ClientPage;
