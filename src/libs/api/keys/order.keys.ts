const keys = {
    GET_ALL_ORDER: (pageNum: number, limit: number) => `/order/all?page_number=${pageNum}&page_size=${limit}`,
    UPDATE_ORDER_STATUS: (id: string) => `/order/update-status/${id}`
};

export default keys;
