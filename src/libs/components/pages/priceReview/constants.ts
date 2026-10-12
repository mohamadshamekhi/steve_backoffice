// TODO: این کلیدها فعلاً فرضی‌اند — تا وقتی بک‌اند کلید ACL واقعی این فیچر را اعلام نکند باید تایید شوند.
export const PRICE_REVIEW_VIEW = 'price-review:view';
export const PRICE_REVIEW_MANAGE = 'price-review:manage';

export const formatPriceReviewDate = (value: string) =>
    new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
