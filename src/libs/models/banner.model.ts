export interface BannerModel {
    id?: string;
    title: string;
    alt_text: string;
    link: string;
    location: 'top' | 'middle' | 'bottom';
    media_id: string;
    image_url?: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface BannerCreateModel {
    title: string;
    alt_text: string;
    link: string;
    location: 'top' | 'middle' | 'bottom';
    media_id: string;
    sort_order: number;
    is_active: boolean;
}

export interface BannerEditModel {
    title?: string;
    alt_text?: string;
    link?: string;
    location?: 'top' | 'middle' | 'bottom';
    media_id?: string;
    sort_order?: number;
    is_active?: boolean;
}
