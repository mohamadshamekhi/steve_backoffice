const keys = {
    GET_REFERRAL_LEADERBOARD: '/backoffice/referral',
    GET_REFERRAL_STATS: '/backoffice/referral/stats',
    GET_REFERRAL_DETAIL: (userId: string) => `/backoffice/referral/${userId}`,
    GET_REFERRAL_SETTINGS: '/backoffice/referral/settings',
    PUT_REFERRAL_SETTINGS: '/backoffice/referral/settings'
};

export default keys;
