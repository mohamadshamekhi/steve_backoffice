const keys = {
    POST_BRAND: '/brand/create',
    GET_BRAND: (id: string) => `/brand/${id}`,
    DELETE_BRAND: (id: string) => `/brand/${id}`,
    PATCH_BRAND: (id: string) => `/brand/${id}`,
    GET_ALL_BRAND: '/brand'
};

export default keys;
