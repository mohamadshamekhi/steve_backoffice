const keys = {
    POST_CATEGORY: '/category/create',
    GET_CATEGORY: (id: string) => `/category/${id}`,
    DELETE_CATEGORY: (id: string) => `/category/${id}`,
    PATCH_CATEGORY: (id: string) => `/category/${id}`,
    GET_ALL_CATEGORY: '/category',
    GET_CATEGORY_FILTER: (id: string) => `/category/storefront/get-filter/${id}`
};

export default keys;
