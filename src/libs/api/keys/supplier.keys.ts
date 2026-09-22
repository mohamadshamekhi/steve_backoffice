const keys = {
    GET_ALL_SUPPLIER: '/backoffice/supplier',

    GET_SUPPLIER: (id: string) => `/backoffice/supplier/${id}`,

    POST_SUPPLIER: '/backoffice/supplier',

    PATCH_SUPPLIER: (id: string) => `/backoffice/supplier/${id}`,

    DELETE_SUPPLIER: (id: string) => `/backoffice/supplier/${id}`
};

export default keys;
