const keys = {
    POST_PRODUCT: '/product/create',

    GET_PRODUCT: (id: string) => `/product/${id}`,

    PATCH_PRODUCT: (id: string) => `/product/${id}`,

    DELETE_PRODUCT: (id: string) => `/product/${id}`,

    GET_ALL_PRODUCT: '/product',

    GET_ALL_PRODUCT_STOREFRONT: '/product/storefront',

    GET_PRODUCT_EXPORT_EXCEL: '/product/export-excel',

    PATCH_PRODUCT_ADD_GALLERY: '/product/add-product-gallery',

    PATCH_PRODUCT_DELETE_GALLERY: `/product/delete-product-gallery`,

    PATCH_PRODUCT_SET_PRIMARY: `/product/set-primary`,

    PATCH_PRODUCT_SET_GALLERY_ALT: '/product/set-gallery-alt',

    PATCH_PRODUCT_ADD_ATTRIBUTE: (id: string) => `/product/${id}/update-attrs`,

    PATCH_PRODUCT_PUBLISHED: (id: string) => `/product/publish/${id}`,

    PATCH_PRODUCT_UNPUBLISHED: (id: string) => `/product/un-publish/${id}`,

    PATCH_PRODUCT_ATTRIBUTE: (id: string, key: string) => `/product/${id}/update-single-attr/${key}`,

    PATCH_PRODUCT_ADD_VARIANT: (id: string) => `/product/${id}/add-variant`,

    PATCH_PRODUCT_UPDATE_VARIANT: (id: string, key: string) => `/product/${id}/update-variant/${key}`,

    PATCH_PRODUCT_DELETE_VARIANT: (id: string, key: string) => `/product/${id}/delete-variant/${key}`,

    PATCH_BULK_UPDATE_VARIANTS: '/product/bulk-update-variants'
};

export default keys;
