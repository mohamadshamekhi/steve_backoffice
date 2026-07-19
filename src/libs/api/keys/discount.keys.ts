const keys = {
    POST_DISCOUNT: '/discount/create',
    GET_DISCOUNT: (id: string) => `/discount/${id}`,
    DELETE_DISCOUNT: (id: string) => `/discount/${id}`,
    PATCH_DISCOUNT: (id: string) => `/discount/${id}`,
    GET_ALL_DISCOUNT: (pageNum: number, limit: number) => `/discount?page_number=${pageNum}&page_size=${limit}`
};

export default keys;
