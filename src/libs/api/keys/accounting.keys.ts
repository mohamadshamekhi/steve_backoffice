const keys = {
    /* -------------------------------- expense ------------------------------- */

    GET_ALL_EXPENSE: '/backoffice/expense',

    GET_EXPENSE: (id: string) => `/backoffice/expense/${id}`,

    POST_EXPENSE: '/backoffice/expense',

    PATCH_EXPENSE: (id: string) => `/backoffice/expense/${id}`,

    DELETE_EXPENSE: (id: string) => `/backoffice/expense/${id}`,

    /* --------------------------------- cash --------------------------------- */

    GET_ALL_CASH: '/backoffice/cash',

    POST_CASH: '/backoffice/cash',

    DELETE_CASH: (id: string) => `/backoffice/cash/${id}`,

    /* ------------------------------ sales return ----------------------------- */

    GET_ALL_SALES_RETURN: '/backoffice/sales-return',

    GET_SALES_RETURN: (id: string) => `/backoffice/sales-return/${id}`,

    POST_SALES_RETURN: '/backoffice/sales-return',

    POST_SALES_RETURN_REFUND: (id: string) => `/backoffice/sales-return/${id}/refund`,

    /* -------------------------------- reports -------------------------------- */

    GET_REPORT_CASH: '/backoffice/report/cash',

    GET_REPORT_PROFIT_LOSS: '/backoffice/report/profit-loss',

    GET_REPORT_SUPPLIER_LEDGER: '/backoffice/report/supplier-ledger'
};

export default keys;
