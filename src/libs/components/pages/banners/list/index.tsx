'use client';

import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { useModal } from 'libs/hooks/modal/useModal';
import { BannerModel } from 'libs/models';
import { Button } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';
import Create from '../create';
import Detail from '../detail';
import Edit from '../edit';

interface ActionCellProps {
    data: BannerModel;
    onDeleted: () => void;
    onUpdated: () => void;
}

const ActionCell = ({ data, onUpdated, onDeleted }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();
    const [modalType, setModalType] = useState('');

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const deleteBanner = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_BANNER(data.id!), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete Banner:', error);
        }
    };

    return (
        <div className='relative'>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-0 z-[100] min-w-[150px]'>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('detail');
                    }}
                >
                    جزییات
                </Dropdown.Item>

                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('edit');
                    }}
                >
                    ویرایش
                </Dropdown.Item>

                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('delete');
                    }}
                    className='text-red-500 hover:bg-red-100 hover:text-red-500'
                >
                    حذف
                </Dropdown.Item>
            </Dropdown>

            <Switch>
                <Case condition={modalType === 'edit'}>
                    <Edit onUpdated={onUpdated} data={data} onClose={closeModal} isOpen={isOpen} />
                </Case>

                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        onDelete={() => deleteBanner()}
                        onClose={closeModal}
                        isOpen={isOpen}
                        loading={deleteLoading}
                    />
                </Case>

                <Case condition={modalType === 'detail'}>
                    <Detail data={data} isOpen={isOpen} onClose={closeModal} />
                </Case>
            </Switch>
        </div>
    );
};

interface SortableRowProps {
    banner: BannerModel;
    index: number;
    onUpdated: () => void;
    onDeleted: () => void;
}

const SortableRow = ({ banner, index, onUpdated, onDeleted }: SortableRowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: banner.id!
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f3f4f6' : 'transparent'
    };

    const locationMap: Record<string, string> = {
        top: 'بالا',
        middle: 'وسط',
        bottom: 'پایین'
    };

    return (
        <tr ref={setNodeRef} style={style} className='border-b hover:bg-gray-50 dark:hover:bg-gray-800'>
            <td className='px-4 py-3 text-center'>
                <div
                    {...attributes}
                    {...listeners}
                    className='cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing'
                >
                    ☰
                </div>
            </td>
            <td className='px-4 py-3 text-center'>{index + 1}</td>
            <td className='px-4 py-3'>
                <Image
                    className='rounded-md'
                    src={banner.image_url ?? noPic}
                    alt={banner.alt_text}
                    width={60}
                    height={60}
                    loading='lazy'
                />
            </td>
            <td className='px-4 py-3'>{banner.title}</td>
            <td className='max-w-[200px] truncate px-4 py-3'>{banner.link}</td>
            <td className='px-4 py-3 text-center'>{locationMap[banner.location]}</td>
            <td className='px-4 py-3 text-center'>{banner.sort_order}</td>
            <td className='px-4 py-3 text-center'>
                <span
                    className={`rounded-full px-2 py-1 text-xs ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {banner.is_active ? 'فعال' : 'غیرفعال'}
                </span>
            </td>
            <td className='relative px-4 py-3'>
                <ActionCell data={banner} onDeleted={onDeleted} onUpdated={onUpdated} />
            </td>
        </tr>
    );
};

const List = () => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { isLoading, data, mutate } = useSWR(
        ApiKeys.GET_ALL_BANNER,
        (url: string) =>
            fetcher(url, 'dashboard', 'GET', {
                params: { page_number: page, page_size: limit }
            }),
        {
            revalidateOnFocus: false
        }
    );

    const [banners, setBanners] = useState<BannerModel[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();

    useEffect(() => {
        if (data?.data?.banners) {
            setBanners(data.data.banners);
        }
    }, [data]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = banners.findIndex((banner) => banner.id === active.id);
        const newIndex = banners.findIndex((banner) => banner.id === over.id);

        const originalBanners = [...banners];
        const newBanners = arrayMove(banners, oldIndex, newIndex);

        const updatedBanners = newBanners.map((banner, index) => ({
            ...banner,
            sort_order: index + 1
        }));

        setBanners(updatedBanners);
        setIsUpdating(true);

        try {
            const updatePromises = updatedBanners.map((banner) =>
                fetcher(ApiKeys.PATCH_BANNER(banner.id!), 'dashboard', 'PATCH', {
                    body: {
                        sort_order: banner.sort_order
                    }
                })
            );

            await Promise.all(updatePromises);
            toast.success('ترتیب بنرها با موفقیت به‌روزرسانی شد');
            mutate();
        } catch (error) {
            console.error('Failed to update banner order:', error);
            toast.error('خطا در به‌روزرسانی ترتیب بنرها');
            setBanners(originalBanners);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <ContentWrapper
            title='بنرها'
            extra={
                <Button onClick={openModal} size='sm' className='bg-brand-500 hover:bg-brand-600 text-white'>
                    درج بنر +
                </Button>
            }
        >
            {isUpdating && (
                <div className='mb-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'>
                    در حال به‌روزرسانی ترتیب بنرها...
                </div>
            )}
            <div className='relative overflow-x-auto'>
                {isLoading ? (
                    <div className='flex h-64 items-center justify-center'>
                        <div className='text-gray-500'>در حال بارگذاری...</div>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <table className='w-full text-right text-sm text-gray-700 dark:text-gray-300'>
                            <thead className='bg-gray-100 text-xs uppercase dark:bg-gray-700'>
                                <tr>
                                    <th className='w-12 px-4 py-3 text-center'>جابجایی</th>
                                    <th className='w-12 px-4 py-3 text-center'>#</th>
                                    <th className='px-4 py-3'>تصویر</th>
                                    <th className='px-4 py-3'>عنوان</th>
                                    <th className='px-4 py-3'>لینک</th>
                                    <th className='px-4 py-3 text-center'>موقعیت</th>
                                    <th className='px-4 py-3 text-center'>ترتیب</th>
                                    <th className='px-4 py-3 text-center'>وضعیت</th>
                                    <th className='px-4 py-3'>عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext items={banners.map((b) => b.id!)}>
                                    {banners.map((banner, index) => (
                                        <SortableRow
                                            key={banner.id}
                                            banner={banner}
                                            index={index}
                                            onUpdated={mutate}
                                            onDeleted={mutate}
                                        />
                                    ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
                )}
            </div>

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />

            <Create isOpen={isOpen} onClose={closeModal} onCreated={mutate} />
        </ContentWrapper>
    );
};

export default List;
