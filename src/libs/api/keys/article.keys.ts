const keys = {
    POST_ARTICLE: '/article/create',
    GET_ARTICLE: (id: string) => `/article/${id}`,
    DELETE_ARTICLE: (id: string) => `/article/${id}`,
    PATCH_ARTICLE: (id: string) => `/article/${id}`,
    POST_ARTICLE_EXTERNALIZE_IMAGES: '/article/externalize-inline-images',
    GET_ALL_ARTICLE: (pageNum: number, limit: number) => `/article?page_number=${pageNum}&page_size=${limit}`
};

export default keys;
