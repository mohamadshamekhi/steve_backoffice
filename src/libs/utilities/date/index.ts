// import { DateObject, Value } from 'react-multi-date-picker';

// export const convertToGregorianDate = (val: Value): Date | null => {
//     if (val instanceof DateObject) {
//         return val.toDate();
//     }
//     return null;
// };

import moment from 'moment-jalaali';

export function persianToISOString(persianDate: string, time: string = '00:00:00'): string {
    const convertToEnglishNumbers = (str: string) => str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

    const englishDate = convertToEnglishNumbers(persianDate);

    const dateTimeString = `${englishDate} ${time}`;

    const isoString = moment(dateTimeString, 'jYYYY-jMM-jDD HH:mm:ss').toISOString();

    return isoString;
}
