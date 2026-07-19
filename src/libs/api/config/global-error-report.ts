import { PublicConfiguration } from 'swr/_internal';

const onSwrGlobalError = (err: Error, key: string, config: PublicConfiguration) => {
    console.log(
        `level: error \n message: ${err.message} \n ${{
            key,
            extra: config,
            name: err.name,
            stack: err.stack
        }}`
    );
};

export default onSwrGlobalError;
