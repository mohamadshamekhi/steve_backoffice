const keys = {
    GET_ALL_REPAIRS: (pageNum: number, limit: number) => `/repair/backoffice?page_number=${pageNum}&page_size=${limit}`,
    GET_REPAIR: (id: string) => `/repair/backoffice/${id}`,
    PATCH_REPAIR: (id: string) => `/repair/backoffice/${id}`
};

export default keys;
