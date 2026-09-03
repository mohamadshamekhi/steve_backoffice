const keys = {
    GET_ALL_PARTNERS: '/backoffice/partner',
    GET_PARTNER: (id: string) => `/backoffice/partner/${id}`,
    APPROVE_PARTNER: (id: string) => `/backoffice/partner/${id}/approve`,
    REJECT_PARTNER: (id: string) => `/backoffice/partner/${id}/reject`,
    SUSPEND_PARTNER: (id: string) => `/backoffice/partner/${id}/suspend`,
    UNSUSPEND_PARTNER: (id: string) => `/backoffice/partner/${id}/unsuspend`,
    PATCH_PARTNER_PRICING: (id: string) => `/backoffice/partner/${id}/pricing`
};

export default keys;
