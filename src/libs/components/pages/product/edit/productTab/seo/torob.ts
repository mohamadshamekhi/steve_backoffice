const TOROB_UUID = /torob\.com\/p\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

/** همان الگوی بک‌اند: فقط https://torob.com/p/<uuid> */
export const TOROB_URL_PATTERN =
    /^https:\/\/torob\.com\/p\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i;

/**
 * لینکی که از مرورگر کپی می‌شود معمولاً اسم محصول و پارامتر هم دارد
 * (https://torob.com/p/<uuid>/گوشی-…/?utm=…)؛ آن را به شکل استاندارد درمی‌آورد.
 * اگر uuid پیدا نشد همان ورودی (trim شده) برمی‌گردد تا خطای اعتبارسنجی نمایش داده شود.
 */
export const normalizeTorobUrl = (value: string): string => {
    const trimmed = value.trim();
    const match = trimmed.match(TOROB_UUID);
    return match ? `https://torob.com/p/${match[1].toLowerCase()}` : trimmed;
};
