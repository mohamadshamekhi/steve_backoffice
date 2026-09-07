# Steve Backoffice

پنل ادمین Next.js (App Router, Turbopack) + SWR + Formik + Zod + react-select + Tailwind.

## API

- کلاینت: `fetcher(key, 'dashboard' | 'web', method, { params, body })` در [src/libs/api/config/fetcher.ts](src/libs/api/config/fetcher.ts).
- کلیدهای مسیر: [src/libs/api/keys/](src/libs/api/keys/) (هر دامنه یک فایل `*.keys.ts`، همه در `ApiKeys` merge می‌شوند).
- Base URL: `NEXT_PUBLIC_API_URL`.
- همه‌ی پاسخ‌ها قالب `{ success, message, data }` دارند.

### مرجع اندپوینت‌ها (منبع حقیقت)

تمام اندپوینت‌های بک‌اند اینجا مستندند:

```
/Users/mohamadshamekhi/Desktop/Project/steve/api/docs/api-endpoints.json
```

- هر آیتم: `method`, `path`, `auth`, `in` (ورودی)، `out` (خروجی)، `desc` (توضیح کوتاه).
- Postman: `/Users/mohamadshamekhi/Desktop/Project/steve/api/docs/postman/`.
- قبل از کار روی هر فیچری که با API کار دارد، بخش مربوطه‌ی این فایل را بخوان.
- اگر اندپوینت یا فیلدی که لازم داری در این فایل نبود → یعنی بک‌اند ندارد؛ به کاربر بگو تا به تیم بک‌اند منتقل کند (خودت حدس نزن / از `ancestors` و... استخراج نکن).
- این فایل مالِ ریپوی `api` است؛ تیم بک‌اند موقع تغییر روت‌ها آن را به‌روز می‌کند.
