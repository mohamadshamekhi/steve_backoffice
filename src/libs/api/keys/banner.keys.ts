const keys = {
    POST_BANNER: '/banner/create',
    GET_BANNER: (id: string) => `/banner/${id}`,
    DELETE_BANNER: (id: string) => `/banner/${id}`,
    PATCH_BANNER: (id: string) => `/banner/${id}`,
    GET_ALL_BANNER: '/banner',
    UPDATE_BANNER_ORDER: '/banner/update-order'
};

export default keys;
