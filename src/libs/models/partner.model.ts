export type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IPartner {
    id: string;
    user_id: string;
    backoffice_user_id: string;
    status: PartnerStatus;
    discount_percent: number;
    company_name: string;
    national_id: string;
    business_field: string;
    city: string;
    rejection_reason: string;
    reviewed_by: string;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface IPartnersResponse {
    pagination: { page_size: number; page_number: number; total: number };
    partners: IPartner[];
}
