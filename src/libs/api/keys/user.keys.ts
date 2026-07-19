const keys = {
    GET_ALL_USER: '/user',
    PATCH_USER: (id: string) => `/user/${id}/update-profile`,
    GET_ALL_BACKOFFICE: (pageNum: number, limit: number) => `/back-office?page_number=${pageNum}&page_size=${limit}`,
    GET_BACKOFFICE: (id: string) => `/back-office/${id}`,
    POST_BACKOFFICE: '/back-office/add-new-backoffice-user',
    PATCH_BACKOFFICE: (id: string) => `/back-office/update/${id}`,
    GET_ALL_ROLES: '/acl/roles',
    GET_ALL_PERMISSIONS: '/acl/permissions'
};

export default keys;
