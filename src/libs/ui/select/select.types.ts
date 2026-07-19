export type Option = {
    value: string;
    label: string;
};
type CSelectProps = {
    options: Option[];
    defaultValue?: Option;
    isSearchable?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    isRtl?: boolean;
    placeholder?: string;
    isMulti?: boolean;
    name: string;
    value: string;
    onChange: (value: Option | Option[] | null) => void;
};

export default CSelectProps;
