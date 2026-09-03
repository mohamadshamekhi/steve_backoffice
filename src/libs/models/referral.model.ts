export type ReferralDiscountType = 'percentage' | 'fixed_amount';

export interface IReferrerRow {
    user_id: string;
    referrer_name: string;
    referrer_phone: string;
    code: string;
    total_joined: number;
    rewarded_count: number;
    pending_progress: number;
    rewards_earned: number;
    created_at: string;
}

export interface IReferralLeaderboardResponse {
    pagination: { page_size: number; page_number: number; total: number };
    items: IReferrerRow[];
}

export interface IReferralStats {
    total_accounts: number;
    total_invites: number;
    total_joined: number;
    total_rewards: number;
    conversion_rate: number;
}

export interface IReferralInvitee {
    id: string;
    name: string;
    phone_masked: string;
    source: 'link' | 'sms';
    status: 'invited' | 'joined';
    rewarded: boolean;
    invited_at: string;
    joined_at: string | null;
}

export interface IReferralReward {
    id: string;
    discount_code: string;
    created_at: string;
}

export interface IReferralDetail {
    account: IReferrerRow;
    pagination: { page_size: number; page_number: number; total: number };
    referrals: IReferralInvitee[];
    rewards: IReferralReward[];
}

export interface IReferralSettings {
    reward_threshold: number;
    reward_discount_type: ReferralDiscountType;
    reward_discount_value: number;
    reward_valid_days: number;
    reward_minimum_purchase_amount: number;
    welcome_discount_enabled: boolean;
    welcome_discount_type: ReferralDiscountType;
    welcome_discount_value: number;
    welcome_valid_days: number;
}

export interface IReferralSettingsResponse {
    settings: IReferralSettings;
    source: 'config' | 'custom';
    updated_at: string | null;
    updated_by: string;
    program_enabled: boolean;
    invite_base_url: string;
}
