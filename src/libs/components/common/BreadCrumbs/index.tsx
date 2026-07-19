import ChevronLeftIcon from 'libs/components/icons/ChevronLeftIcon';
import { cn } from 'libs/utilities';
import Link from 'next/link';
import BreadCrumbsProps from './bread-crumbs.types';

const BreadCrumbs = ({ links, containerClass = '', labelClass = '', activeClass = '' }: BreadCrumbsProps) => {
    return (
        <ul className={cn('flex items-center gap-1', containerClass)}>
            {links.map((item, index) => (
                <li key={`breadCrumbs${index}`}>
                    {item.href ? (
                        <div className='flex items-center gap-1'>
                            <Link className={cn('text-sm font-semibold text-blue-500', labelClass)} href={item.href}>
                                {item.label}
                            </Link>

                            <ChevronLeftIcon className='mt-0.5 stroke-current text-sm text-gray-500' width='10' />
                        </div>
                    ) : (
                        <span className={cn('text-sm font-semibold text-gray-400', activeClass)}>{item.label}</span>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default BreadCrumbs;
