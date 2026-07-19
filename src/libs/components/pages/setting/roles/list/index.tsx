'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import useSWR from 'swr';

interface Permission {
    id: string;
    name: string;
    description: string;
}

interface RoleProps {
    id: string;
    name: string;
    description: string;
    permission: Permission[];
}

const List: React.FC = () => {
    const { data, isLoading } = useSWR(ApiKeys.GET_ALL_ROLES, (url: string) => fetcher(url, 'dashboard', 'GET'));
    const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openPermissionsModal = (role: RoleProps) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
    };

    const columns: ColumnDef<RoleProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'name',
            header: 'نام نقش',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'description',
            header: 'توضیحات',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: false
        },
        {
            accessorKey: 'permission',
            header: 'دسترسی‌ها',
            cell: ({ row }) => (
                <Button variant='outline' size='sm' onClick={() => openPermissionsModal(row.original)}>
                    {row.original.permission?.length || 0} دسترسی
                </Button>
            ),
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper title='لیست نقش‌ها'>
            <div className='relative'>
                <Table<RoleProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.roles ?? []}
                    loading={isLoading}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='space-y-4'>
                    <h2 className='text-lg font-semibold text-gray-900'>دسترسی‌های نقش: {selectedRole?.name}</h2>
                    <p className='text-sm text-gray-500'>{selectedRole?.description}</p>

                    <div className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-2'>
                        {selectedRole?.permission?.map((perm) => (
                            <div key={perm.id} className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
                                <div className='font-medium text-gray-800'>{perm.name}</div>
                                <div className='mt-1 text-xs text-gray-500'>{perm.description}</div>
                            </div>
                        ))}
                    </div>

                    {(!selectedRole?.permission || selectedRole.permission.length === 0) && (
                        <div className='py-8 text-center text-gray-500'>هیچ دسترسی‌ای برای این نقش تعریف نشده است</div>
                    )}
                </div>
            </Modal>
        </ContentWrapper>
    );
};

export default List;
