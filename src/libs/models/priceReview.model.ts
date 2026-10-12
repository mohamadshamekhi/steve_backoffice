export interface IPriceReviewSettings {
    interval_days: number;
}

export interface IPriceReviewItem {
    product_id: string;
    product_name: string;
    current_price: number;
    last_reviewed_at: string;
    days_overdue: number;
}

export interface IPriceReviewListResponse {
    items: IPriceReviewItem[];
    total: number;
}
