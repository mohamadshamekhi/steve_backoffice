const keys = {
    POST_ATTRIBUTE: '/attribute/create',
    DELETE_ATTRIBUTE: (id: string) => `/attribute/${id}`,
    PATCH_ATTRIBUTE: (id: string) => `/attribute/${id}`,
    GET_ALL_ATTRIBUTE: (pageNum: number, limit: number) => `/attribute?page_number=${pageNum}&page_size=${limit}`
};

export default keys;
