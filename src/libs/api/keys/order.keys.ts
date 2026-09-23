const keys = {
    GET_ALL_ORDER: (pageNum: number, limit: number) => `/order/all?page_number=${pageNum}&page_size=${limit}`,
    UPDATE_ORDER_STATUS: (id: string) => `/order/update-status/${id}`,
    GET_ORDER_DELIVERY_QRCODE: (id: string) => `/backoffice/order/${id}/delivery-qrcode`,
    EDIT_ORDER: (id: string) => `/backoffice/order/${id}`
};

export default keys;
