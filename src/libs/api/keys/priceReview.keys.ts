const keys = {
    GET_PRICE_REVIEW_SETTINGS: '/backoffice/setting/price-review',
    PUT_PRICE_REVIEW_SETTINGS: '/backoffice/setting/price-review',
    GET_PRICE_REVIEW_LIST: '/backoffice/price-review/list',
    CONFIRM_PRICE_REVIEW: (productId: string) => `/backoffice/price-review/${productId}/confirm`
};

export default keys;
