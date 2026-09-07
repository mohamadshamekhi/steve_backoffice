const keys = {
    GET_ALL_SHIPPING: (pageNum: number, limit: number) => `/shipping?page_number=${pageNum}&page_size=${limit}`,
    GET_SHIPPING: (id: string) => `/shipping/${id}`,
    PATCH_SHIPPING: (id: string) => `/shipping/${id}`,
    POST_SHIPPING: `/shipping/create`
};

export default keys;
