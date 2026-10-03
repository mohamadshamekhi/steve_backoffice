"use client";

import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "libs/api";
import ApiKeys from "libs/api/keys";
import ContentWrapper from "libs/components/common/contentWrapper/ContentWrapper";
import { Button, Input, Table } from "libs/ui";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

// دسته‌بندی‌هایی که این صفحه محصولاتشان را برای بروزرسانی قیمت نشان می‌دهد
const TARGET_CATEGORY_NAMES = ["گوشی موبایل", "تبلت"];

interface CategoryModel {
  id: string;
  name: string;
  parent_id: string | null;
}

interface VariantAttribute {
  key: string;
  value: string;
  label: string;
}

interface VariantModel {
  id: string;
  price: number;
  quantity: number;
  warranty: string;
  variant_attribute: VariantAttribute[];
}

interface ProductModel {
  id: string;
  name: string;
  variant?: VariantModel[];
}

interface PriceRow {
  id: string; // شناسه‌ی variant (رنگ) - نه محصول
  productId: string;
  title: string;
  variant: VariantModel;
  currentPrice: number;
  suggestedPrice: number | null;
  approved: boolean;
  status: "idle" | "saving" | "done" | "error";
}

// یک ردیف خام که از روی عکس (بدون هیچ تفسیر یا تطبیقی) رونویسی شده است
interface ExtractedItem {
  brand: string;
  raw: string;
  price: number;
}

const formatPrice = (price: number) =>
  price ? `${price.toLocaleString("fa-IR")} تومان` : "-";

// لیست‌های قیمت عمده‌فروشی معمولاً سه صفر آخر قیمت را حذف می‌کنند (مثلاً 443000 به‌جای 443000000)
// چون هیچ گوشی/تبلتی زیر این عدد قیمت واقعی ندارد، این عدد را نشانه‌ی «هزار تومان» در نظر می‌گیریم
const MIN_REALISTIC_PRICE = 1_000_000;
const normalizePrice = (price: number) =>
  price > 0 && price < MIN_REALISTIC_PRICE ? price * 1000 : price;

const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const GEMINI_ENDPOINT = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// عکس را برای ارسال به Gemini به base64 خام (بدون پیشوند data:...;base64,) تبدیل می‌کند
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// مرحله‌ی یک: فقط رونویسی خام از روی عکس - بدون هیچ تفسیر، تطبیق یا حدس‌زدنی
// جدا نگه‌داشتن این مرحله از تطبیق باعث می‌شود دقت OCR بالاتر برود
const buildExtractionPrompt = () => `تصویر پیوست‌شده یک لیست قیمت عمده‌فروشی موبایل، تبلت و/یا لوازم جانبی است. این تصویر معمولاً چند ستون دارد و هر ستون مربوط به یک برند مشخص است (مثلاً Samsung، Xiaomi، iPhone/Apple، Nokia، Accessories یا مشابه).

وظیفه‌ی تو در این مرحله فقط رونویسی دقیق است، نه تشخیص محصول و نه تطبیق با چیز دیگری. برای تک‌تک ردیف‌هایی که یک کد/مدل محصول و یک قیمت عددی مقابلش دارند:
- نام برند همان ستون را در brand بنویس (دقیقاً همان‌طور که در بالای ستون نوشته شده).
- متن کد/مدل محصول را کامل، حرف‌به‌حرف و رقم‌به‌رقم، دقیقاً همان‌طور که چاپ شده در raw بنویس. چیزی از آن کم یا اضافه نکن، چیزی را حدس نزن یا تصحیح نکن، حتی اگر عجیب یا بی‌معنی به‌نظر برسد.
- عدد قیمت مقابل آن ردیف را دقیقاً همان‌طور که چاپ شده (بدون کاما، بدون واحد، و بدون اضافه یا کم‌کردن هیچ رقم/صفری) در price بنویس. صفر اضافه نکن و صفر کم نکن، حتی اگر فکر می‌کنی قیمت واقعی باید عدد بزرگ‌تری باشد - همان رقم چاپ‌شده کافی است.

ردیف‌هایی که به‌جای قیمت چیزی مثل "soon"، "به‌زودی" یا خانه‌ی خالی دارند را در خروجی نیاور.
خروجی را فقط دقیقاً مطابق اسکیمای داده‌شده (آرایه‌ای از brand، raw، price) برگردان، بدون هیچ توضیح یا متن اضافه.`;

// مرحله‌ی دو: فقط یک تطبیق متنی (بدون عکس) بین لیست خام مرحله‌ی یک و محصولات خودمان
// چون این مرحله دیگر تصویر ندارد، دقتش خیلی بالاتر از تطبیق هم‌زمان با خواندن عکس است
const buildMatchPrompt = (
  extracted: ExtractedItem[],
  products: { id: string; title: string }[]
) => `شما دستیار تطبیق قیمت محصولات هستید. دو لیست زیر را داری:

۱) لیست خام رونویسی‌شده از یک لیست قیمت عمده‌فروشی (برند، متن خام کد محصول همان‌طور که چاپ شده، و قیمت همان‌طور که چاپ شده):
${JSON.stringify(extracted)}

۲) لیست محصولات فروشگاه ما که باید برایشان قیمت پیدا کنی، هرکدام با شناسه (id) و عنوان کامل. هر آیتم این لیست یک رنگ/تنوع مشخص از یک محصول است (رنگ آن، اگر مشخص باشد، بعد از " - " در عنوان آمده):
${JSON.stringify(products)}

فقط برای آیتم‌هایی از لیست ۲ که معادل دقیقشان را در لیست ۱ پیدا می‌کنی، id و قیمت متناظر را برگردان.

نکات مهم برای خواندن کدهای فشرده‌ی لیست ۱ (raw):
- این کدها معمولاً از پشت‌سرهم قرارگرفتن چند بخش تشکیل شده‌اند: مدل گوشی، نوع/تیپ گوشی، حافظه (ظرفیت به گیگابایت، گاهی به‌صورت "128/4" یعنی حافظه ۱۲۸ و رم ۴)، رنگ، و گاهی پارت‌نامبر یا یک حرف اضافه در انتها.
- مثال ۱: "17ProMax256BluZaa" یعنی مدل 17 Pro Max، حافظه 256 گیگابایت، رنگ آبی (Blu)، پارت‌نامبر Zaa.
- مثال ۲: "A17 128/4 BluV" یعنی مدل A17، حافظه داخلی 128 گیگابایت (و رم 4 گیگابایت)، رنگ آبی (Blu). حرف "V" در همین‌جا بخشی از رنگ نیست؛ در لیست‌های عمده‌فروشی نشانه‌ی نوع گارانتی/ویترین‌بودن کالاست، آن را کاملاً نادیده بگیر و در تشخیص رنگ دخالتش نده.
- فقط وقتی یک قیمت را به یک id نسبت بده که مطمئن باشی برند، مدل، نوع/تیپ گوشی، حافظه، رنگ و پارت‌نامبر (هرکدام که در raw مشخص شده) همگی دقیقاً با عنوان همان id مطابقت دارند. اگر حتی یکی از این موارد (مثلاً فقط حافظه یا فقط پارت‌نامبر) فرق داشت، آن را یک محصول دیگر در نظر بگیر، نه همان.
- هرگز بین برندهای مختلف تطبیق نده (مثلاً کد ستون Xiaomi را به محصول Apple نسبت نده).

⚠️ مهم‌ترین و حساس‌ترین بخش این کار، تطبیق درست «رنگ» است. هیچ اشتباهی در این مورد قابل قبول نیست، چون قیمت رنگ‌های مختلف یک محصول با هم فرق دارد و اگر قیمت یک رنگ را اشتباهی به رنگ دیگری از همان محصول نسبت بدهی، باعث ثبت قیمت غلط در فروشگاه می‌شود.
قوانین رنگ:
1. برای هر ردیف از لیست ۲، فقط قیمتی را برگردان که مطمئن هستی دقیقاً مربوط به همان رنگِ نوشته‌شده در عنوان آن ردیف است.
2. اگر لیست ۱ برای یک محصول چند رنگ را با قیمت‌های جدا نشان می‌دهد، هر قیمت را فقط به همان رنگ خودش نسبت بده؛ هرگز قیمت یک رنگ را برای رنگ دیگر همان محصول استفاده نکن.
3. اگر لیست ۱ برای یک محصول فقط یک قیمت (بدون تفکیک رنگ) نشان می‌دهد، همان یک قیمت را برای همه‌ی رنگ‌های آن محصول که در لیست ۲ هستند برگردان.
4. اگر در مورد تطبیق رنگ یک ردیف مطمئن نیستی، آن ردیف را کلاً در خروجی نیاور - برگرداندن قیمت اشتباه بسیار بدتر از برنگرداندن قیمت است.
5. قبل از نهایی‌کردن پاسخ، یک‌بار دیگر تک‌تک id هایی که برمی‌گردانی را با رنگ نوشته‌شده در عنوانشان و رنگ همان ردیف در لیست ۱ مقایسه کن تا مطمئن شوی هیچ رنگی جابه‌جا نشده است.

راهنمای مخفف‌های رایج رنگ (این‌ها را دقیقاً با معادلشان تطبیق بده، و با رنگ‌های دیگر اشتباه نگیر):
- Blu / Blue = آبی
- Silv / Sliv / Wht / White = نقره‌ای یا سفید یا سیلور (هر سه را یکی در نظر بگیر)
- Org / Orange = نارنجی
- Blk / Black = مشکی
- Grn / Green = سبز
- Prp / Purple = بنفش
- Gold = طلایی
- Navy = سرمه‌ای
- Pink = صورتی
- Gray = خاکستری
- Tit / Titanium = تیتانیومی
- Mix = رنگ‌بندی نامشخص/ترکیبی (این حالت را فقط وقتی به یک id نسبت بده که عنوان آن id هم رنگ مشخصی نداشته باشد)

نکته‌ی دیگر درباره‌ی حافظه و پارت‌نامبر: به مدل، نوع/تیپ گوشی، میزان حافظه و پارت‌نامبر هم دقیقاً مثل رنگ دقت کن. دو محصول ممکن است فقط در یکی از این موارد (مثلاً فقط حافظه یا فقط پارت‌نامبر) با هم فرق داشته باشند و قیمت‌شان هم متفاوت باشد؛ آن‌ها را با هم اشتباه نگیر.

نکته درباره‌ی قیمت: قیمت لیست ۱ را عیناً و دست‌نخورده (بدون هیچ تغییر، ضرب، یا اضافه‌کردن صفر) در price برگردان؛ تبدیل واحد قیمت را خود برنامه بعداً انجام می‌دهد، وظیفه‌ی تو فقط پیدا کردن ردیف درست و برگرداندن عدد دست‌نخورده‌ی قیمت همان ردیف است.

خروجی را فقط دقیقاً مطابق اسکیمای داده‌شده (آرایه‌ای از id و price) برگردان، بدون هیچ توضیح اضافه.`;

// یک درخواست generateContent به Gemini با اسکیمای خروجی مشخص می‌زند
// و آرایه‌ی پاسخ را طبق اسکیمای داده‌شده برمی‌گرداند
const callGemini = async <T,>(
  parts: object[],
  responseSchema: object
): Promise<T[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error("کلید Gemini تنظیم نشده است (NEXT_PUBLIC_GEMINI_API_KEY)");
  }

  const response = await fetch(GEMINI_ENDPOINT(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "ARRAY", items: responseSchema },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "خطا در ارتباط با Gemini");
  }

  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("پاسخی از Gemini دریافت نشد");

  return JSON.parse(text);
};

const UpdatePrice = () => {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestStage, setSuggestStage] = useState<
    "idle" | "reading" | "matching"
  >("idle");
  const [isApplying, setIsApplying] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoryData, isLoading: isCategoryLoading } = useSWR(
    ApiKeys.GET_ALL_CATEGORY_STOREFRONT,
    (url: string) => fetcher(url, "web", "GET", { params: { page_size: 100 } })
  );

  const categories: CategoryModel[] = categoryData?.data?.categories ?? [];
  const categoryIds = categories
    .filter((category) => TARGET_CATEGORY_NAMES.includes(category.name.trim()))
    .map((category) => category.id);

  const { data: products, isLoading: isProductsLoading } = useSWR(
    categoryIds.length ? ["products-phone-tablet", ...categoryIds] : null,
    async () => {
      const responses = await Promise.all(
        categoryIds.map((categoryId) =>
          fetcher(ApiKeys.GET_ALL_PRODUCT_STOREFRONT, "web", "GET", {
            params: { category_id: categoryId, page_size: 1000 },
          })
        )
      );

      return responses.flatMap(
        (response) => response?.data?.products ?? []
      ) as ProductModel[];
    }
  );

  // با رسیدن لیست محصولات، به ازای هر رنگ/variant یک ردیف جدا ساخته می‌شود
  // چون رنگ‌های مختلف یک محصول می‌توانند قیمت متفاوتی داشته باشند
  useEffect(() => {
    if (!products) return;

    setRows(
      products.flatMap((product) =>
        (product.variant ?? []).map((variant) => {
          const colorLabel = variant.variant_attribute?.[0]?.label;
          const title = colorLabel
            ? `${product.name.trim()} - ${colorLabel}`
            : product.name.trim();

          return {
            id: variant.id,
            productId: product.id,
            title,
            variant,
            currentPrice: variant.price,
            suggestedPrice: null,
            approved: false,
            status: "idle" as const,
          };
        })
      )
    );
  }, [products]);

  const handleSuggestPrices = async () => {
    if (!image) {
      toast.error("لطفا ابتدا عکس لیست قیمت را انتخاب کنید");
      return;
    }

    if (!GEMINI_API_KEY) {
      toast.error("کلید Gemini تنظیم نشده است (NEXT_PUBLIC_GEMINI_API_KEY)");
      return;
    }

    try {
      setIsSuggesting(true);
      setExtractedItems([]);

      // مرحله‌ی یک: فقط رونویسی خام از روی عکس (بدون تطبیق)
      setSuggestStage("reading");
      const base64Image = await fileToBase64(image);
      const extracted = await callGemini<ExtractedItem>(
        [
          { text: buildExtractionPrompt() },
          {
            inline_data: {
              mime_type: image.type || "image/jpeg",
              data: base64Image,
            },
          },
        ],
        {
          type: "OBJECT",
          properties: {
            brand: { type: "STRING" },
            raw: { type: "STRING" },
            price: { type: "NUMBER" },
          },
          required: ["brand", "raw", "price"],
        }
      );

      setExtractedItems(extracted);

      if (!extracted.length) {
        toast.error("هیچ ردیفی از روی عکس خوانده نشد");
        return;
      }

      // مرحله‌ی دو: تطبیق متنی (بدون عکس) بین لیست خام و محصولات خودمان
      setSuggestStage("matching");
      const productsPayload = rows.map((row) => ({
        id: row.id,
        title: row.title,
      }));

      const suggestions = await callGemini<{ id: string; price: number }>(
        [{ text: buildMatchPrompt(extracted, productsPayload) }],
        {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            price: { type: "NUMBER" },
          },
          required: ["id", "price"],
        }
      );

      const suggestionMap = new Map(
        suggestions.map((s) => [s.id, normalizePrice(s.price)])
      );

      setRows((prev) =>
        prev.map((row) => {
          const suggested = suggestionMap.get(row.id);
          if (suggested === undefined)
            return { ...row, suggestedPrice: null, approved: false };

          return {
            ...row,
            suggestedPrice: suggested,
            approved: true,
            status: "idle",
          };
        })
      );

      if (!suggestions.length) {
        toast.error(
          "هیچ‌کدام از محصولات با موارد خوانده‌شده از عکس با اطمینان تطبیق پیدا نکردند"
        );
      } else {
        toast.success(
          `قیمت ${suggestions.length} محصول از روی عکس پیدا شد، بررسی کن و تایید بزن`
        );
      }
    } catch (error) {
      console.error("Failed to get price suggestions:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت قیمت پیشنهادی"
      );
    } finally {
      setIsSuggesting(false);
      setSuggestStage("idle");
    }
  };

  const handleApply = async () => {
    const targets = rows.filter(
      (row) =>
        row.approved &&
        row.suggestedPrice !== null &&
        row.suggestedPrice !== row.currentPrice
    );

    if (!targets.length) {
      toast.error("هیچ قیمت تاییدشده‌ای برای اعمال وجود ندارد");
      return;
    }

    try {
      setIsApplying(true);

      setRows((prev) =>
        prev.map((row) =>
          targets.some((t) => t.id === row.id)
            ? { ...row, status: "saving" }
            : row
        )
      );

      const response = await fetcher(
        ApiKeys.PATCH_BULK_UPDATE_VARIANTS,
        "dashboard",
        "PATCH",
        {
          body: {
            items: targets.map((row) => ({
              product_id: row.productId,
              variant_id: row.variant.id,
              price: row.suggestedPrice,
            })),
          },
        }
      );

      const results: { variant_id: string; success: boolean; message?: string }[] =
        response?.data?.results ?? [];
      const resultMap = new Map(results.map((r) => [r.variant_id, r]));

      setRows((prev) =>
        prev.map((row) => {
          if (!targets.some((t) => t.id === row.id)) return row;

          const result = resultMap.get(row.id);

          return result?.success
            ? {
                ...row,
                currentPrice: row.suggestedPrice as number,
                suggestedPrice: null,
                approved: false,
                status: "done",
              }
            : { ...row, status: "error" };
        })
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (successCount)
        toast.success(`قیمت ${successCount} محصول با موفقیت بروزرسانی شد`);
      if (failCount)
        toast.error(`بروزرسانی ${failCount} محصول با خطا مواجه شد`);
    } catch (error) {
      console.error("Failed to apply prices:", error);
      toast.error("خطا در اعمال قیمت‌های جدید");
    } finally {
      setIsApplying(false);
    }
  };

  const columns: ColumnDef<PriceRow>[] = [
    {
      accessorKey: "title",
      header: "محصول / رنگ",
      enableSorting: true,
    },
    {
      accessorKey: "currentPrice",
      header: "قیمت فعلی",
      cell: ({ row }) => formatPrice(row.original.currentPrice),
    },
    {
      id: "suggestedPrice",
      header: "قیمت پیشنهادی (از روی عکس)",
      cell: ({ row }) => {
        if (row.original.suggestedPrice === null)
          return <span className="text-gray-400">-</span>;
        return (
          <Input
            type="number"
            min="0"
            className="w-36"
            value={row.original.suggestedPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRows((prev) =>
                prev.map((r) =>
                  r.id === row.original.id ? { ...r, suggestedPrice: value } : r
                )
              );
            }}
          />
        );
      },
    },
    {
      id: "approved",
      header: "اعمال شود",
      cell: ({ row }) => {
        if (row.original.suggestedPrice === null) return null;

        return (
          <input
            type="checkbox"
            className="accent-brand-500 h-4 w-4"
            checked={row.original.approved}
            onChange={(e) => {
              const checked = e.target.checked;
              setRows((prev) =>
                prev.map((r) =>
                  r.id === row.original.id ? { ...r, approved: checked } : r
                )
              );
            }}
          />
        );
      },
    },
    {
      id: "status",
      header: "وضعیت",
      cell: ({ row }) => {
        switch (row.original.status) {
          case "saving":
            return (
              <span className="text-brand-500 text-xs">
                در حال بروزرسانی...
              </span>
            );
          case "done":
            return <span className="text-xs text-green-600">بروزرسانی شد</span>;
          case "error":
            return (
              <span className="text-error-500 text-xs">خطا در بروزرسانی</span>
            );
          default:
            return null;
        }
      },
    },
  ];

  const approvedCount = rows.filter(
    (row) => row.approved && row.suggestedPrice !== null
  ).length;

  const suggestButtonLabel =
    suggestStage === "reading"
      ? "در حال خواندن عکس..."
      : suggestStage === "matching"
        ? "در حال تطبیق با محصولات..."
        : "دریافت قیمت جدید از روی عکس";

  const suggestStageDescription =
    suggestStage === "reading"
      ? "مرحله ۱ از ۲ - در حال خواندن و رونویسی دقیق متن از روی عکس با هوش مصنوعی..."
      : suggestStage === "matching"
        ? `مرحله ۲ از ۲ - در حال تطبیق ${extractedItems.length} مورد خوانده‌شده از عکس با محصولات فروشگاه...`
        : "";

  return (
    <ContentWrapper title="اپدیت کردن قیمت گوشی و تبلت">
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between dark:border-gray-800">
        <div className="flex flex-col gap-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            عکس لیست قیمت گوشی/تبلت
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              آپلود تصویر
            </Button>
            {image && (
              <span className="max-w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
                {image.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            disabled={!image || isProductsLoading || isCategoryLoading}
            loading={isSuggesting}
            onClick={handleSuggestPrices}
          >
            {suggestButtonLabel}
          </Button>

          <Button
            size="sm"
            variant="success"
            className="w-full sm:w-auto"
            disabled={!approvedCount}
            loading={isApplying}
            onClick={handleApply}
          >
            اعمال قیمت‌های تاییدشده {approvedCount ? `(${approvedCount})` : ""}
          </Button>
        </div>
      </div>

      {suggestStage !== "idle" && (
        <div className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800/60 dark:bg-brand-500/10 dark:text-brand-300 mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
          <span className="border-brand-500 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
          <span>{suggestStageDescription}</span>
        </div>
      )}

      {extractedItems.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
            onClick={() => setShowExtracted((prev) => !prev)}
          >
            <span>
              متن خام استخراج‌شده از عکس ({extractedItems.length} مورد) - برای
              بررسی این‌که Gemini عکس را درست خوانده کلیک کن
            </span>
            <span>{showExtracted ? "▲" : "▼"}</span>
          </button>

          {showExtracted && (
            <div className="max-h-64 overflow-y-auto border-t border-gray-100 p-4 dark:border-gray-800">
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {extractedItems.map((item, index) => (
                  <li key={index} className="flex flex-wrap gap-2">
                    <span className="text-gray-400">[{item.brand}]</span>
                    <span>{item.raw}</span>
                    <span className="text-gray-400">-</span>
                    <span>{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Table<PriceRow>
        loading={isCategoryLoading || isProductsLoading}
        headerClass="text-nowrap"
        columns={columns}
        data={rows}
      />
    </ContentWrapper>
  );
};

export default UpdatePrice;
