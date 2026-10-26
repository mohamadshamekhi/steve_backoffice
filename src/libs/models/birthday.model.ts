export type BirthdayDiscountType = 'percentage' | 'fixed_amount';

export interface IBirthdaySettings {
    enabled: boolean;
    /** چند روز قبل از تولد (۰ = همان روز) */
    days_before: number;
    /** ساعت ارسال به وقت تهران (۰ تا ۲۳) */
    send_hour: number;
    discount_type: BirthdayDiscountType;
    discount_value: number;
    valid_days: number;
    minimum_purchase_amount: number;
}

export interface IBirthdaySettingsResponse {
    settings: IBirthdaySettings;
    source: 'config' | 'custom';
    updated_at?: string | null;
    updated_by?: string;
}

export interface IBirthdayReward {
    id: string;
    user_id: string;
    user_name?: string;
    phone_number: string;
    year: number;
    birthday_on: string;
    discount_id?: string;
    discount_code?: string;
    sms_sent: boolean;
    created_at: string;
}

export interface IBirthdayRunResult {
    enabled: boolean;
    matched: number;
    granted: number;
    skipped: number;
    failed: number;
}
