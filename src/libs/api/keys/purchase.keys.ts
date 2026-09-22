const keys = {
    GET_ALL_PURCHASE: '/backoffice/purchase',

    GET_PURCHASE: (id: string) => `/backoffice/purchase/${id}`,

    POST_PURCHASE: '/backoffice/purchase',

    PATCH_PURCHASE: (id: string) => `/backoffice/purchase/${id}`,

    POST_PURCHASE_CONFIRM: (id: string) => `/backoffice/purchase/${id}/confirm`,

    POST_PURCHASE_CANCEL: (id: string) => `/backoffice/purchase/${id}/cancel`,

    POST_PURCHASE_PAYMENT: (id: string) => `/backoffice/purchase/${id}/payment`
};

export default keys;
