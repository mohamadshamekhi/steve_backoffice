const keys = {
    GET_ALL_SELLS: (pageNum: number, limit: number) => `/sell/backoffice?page_number=${pageNum}&page_size=${limit}`,
    GET_SELL: (id: string) => `/sell/backoffice/${id}`,
    PATCH_SELL: (id: string) => `/sell/backoffice/${id}`
};

export default keys;
