const keys = {
    POST_COMMENT: '/comment/create',
    POST_BACKOFFICE_COMMENT: '/comment/backoffice/add',
    GET_COMMENT: (id: string) => `/comment/${id}`,
    DELETE_COMMENT: (id: string) => `/comment/${id}`,
    PATCH_COMMENT: (id: string) => `/comment/update/${id}`,
    GET_ALL_COMMENT: (pageNum: number, limit: number) => `/comment?page_number=${pageNum}&page_size=${limit}`
};

export default keys;
