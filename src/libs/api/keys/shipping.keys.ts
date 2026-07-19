const keys = {
    GET_ALL_SHIPPING: (pageNum: number, limit: number) => `/shipping?page_number=${pageNum}&page_size=${limit}`,
    POST_SHIPPING: `/shipping/create`
};

export default keys;
