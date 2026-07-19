import { IContactUs } from 'libs/models/contactUs.model';

const Detail = ({ data }: { data: IContactUs }) => {
    return (
        <div className='mt-6'>
            <ul className='space-y-2 *:border-b *:border-gray-100 *:p-2'>
                <li className='flex flex-wrap items-start gap-2'>
                    <div className='basis-1/4 font-semibold text-gray-400'>ایمیل:</div>
                    <span>{data.Email}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2'>
                    <div className='basis-1/4 font-semibold text-gray-400'>شماره تماس:</div>
                    <span>{data.PhoneNumber}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2'>
                    <div className='basis-1/4 font-semibold text-gray-400'>موضوع:</div>
                    <span>{data.Subject}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2'>
                    <div className='basis-1/4 font-semibold text-gray-400'>توضیحات:</div>
                    <span className='basis-3/4 whitespace-pre-wrap'>{data.Description}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2'>
                    <div className='basis-1/4 font-semibold text-gray-400'>تاریخ ثبت:</div>
                    <span>{new Date(data.CreatedAt).toLocaleDateString('fa-IR')}</span>
                </li>
            </ul>
        </div>
    );
};

export default Detail;
