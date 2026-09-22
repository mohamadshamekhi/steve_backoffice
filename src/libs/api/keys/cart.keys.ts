const keys = {
    GET_ALL: (pageNum: number, limit: number) => `/cart/backoffice/all?page_size=${pageNum}&page_size=${limit}`,
    BACKOFFICE_UPSERT_USER: '/backoffice/user/upsert',
    BACKOFFICE_UPDATE_USER: (id: string) => `/backoffice/user/${id}`,
    BACKOFFICE_GET_ACTIVE_CART: (userId: string) => `/backoffice/cart/get-active/${userId}`,
    BACKOFFICE_CREATE_CART: '/backoffice/cart/create',
    BACKOFFICE_ADD_ITEM: '/backoffice/cart/add-item',
    BACKOFFICE_REMOVE_ITEM: '/backoffice/cart/remove-item',
    BACKOFFICE_DELETE_ITEM: '/backoffice/cart/delete-item',
    BACKOFFICE_CUSTOM_ITEM: '/backoffice/cart/custom-item',
    BACKOFFICE_ITEM_DISCOUNT: '/backoffice/cart/item-discount',
    BACKOFFICE_CART_DISCOUNT: '/backoffice/cart/discount',
    BACKOFFICE_REGISTER_ORDER: '/backoffice/order/register',
    BACKOFFICE_COMPLETE_ORDER: '/backoffice/order/complete-order',
    BACKOFFICE_CHECK_PENDING_ORDER: (userId: string) => `/backoffice/order/check-pending-exist/${userId}`
};

export default keys;
