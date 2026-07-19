const keys = {
    POST_ATTRIBUTE_DEFINITION: '/attribute-definition/create',
    DELETE_ATTRIBUTE_DEFINITION: (id: string) => `/attribute-definition/${id}`,
    PATCH_ATTRIBUTE_DEFINITION: (id: string) => `/attribute-definition/${id}`,
    GET_ALL_ATTRIBUTE_DEFINITION: (pageNum: number, limit: number) =>
        `/attribute-definition?page_number=${pageNum}&page_size=${limit}`,
    SEARCH_ATTRIBUTE_DEFINITION: (name: string) =>
        `/attribute-definition?name=${encodeURIComponent(name)}&page_number=1&page_size=100`
};

export default keys;
