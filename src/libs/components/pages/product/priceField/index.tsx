'use client';
import { Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { priceToWords, toEnglishDigits } from 'libs/utilities';

interface IProps {
    value: number | '';
    onChange: (value: number) => void;
    touched?: { [key: string]: boolean };
    errors?: { [key: string]: string | string[] };
    className?: string;
    label?: string;
}

const toNumber = (raw: string) => Number(toEnglishDigits(raw).replace(/[^\d]/g, '')) || 0;

/**
 * قیمت خدمت مستقیم روی خود محصول ثبت می‌شود؛ کالاها قیمتشان روی واریانت است.
 */
const ServicePriceField = ({
    value,
    onChange,
    touched,
    errors,
    className = 'col-span-2 w-full md:col-span-1',
    label = 'قیمت خدمت (تومان)'
}: IProps) => (
    <Fieldset
        label={label}
        name='price'
        touched={touched}
        errors={errors}
        className={className}
        hint={value ? priceToWords(Number(value)) : 'قیمت خدمت نیازی به تعریف واریانت ندارد.'}
    >
        <Input
            name='price'
            inputMode='numeric'
            dir='ltr'
            placeholder='مثال: ۵۰۰,۰۰۰'
            error={Boolean(touched?.price && errors?.price)}
            value={value ? Number(value).toLocaleString('fa-IR') : ''}
            onChange={(e) => onChange(toNumber(e.target.value))}
        />
    </Fieldset>
);

export default ServicePriceField;
