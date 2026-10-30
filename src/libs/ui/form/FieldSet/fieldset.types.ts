type FieldsetProps = {
    children: React.ReactNode;
    name: string;
    hint?: React.ReactNode;
    label?: string;
    // errors?: { [key: string]: string };
    // touched?: { [key: string]: boolean };
    errors?: { [key: string]: string | string[] };
    touched?: { [key: string]: boolean };
    className?: string;
    labelClass?: string;
    errorClass?: string;
    hintClass?: string;
};
export default FieldsetProps;
