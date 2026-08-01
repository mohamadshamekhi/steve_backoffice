import { z } from "zod";

export const discountSchema = z.object({
  expires_at: z.string({ message: " زمان اتمام الزامی است" }),
  starts_at: z.string({ message: " زمان شروع الزامی است" }),
  code: z.string().optional(),
  value: z.number({ message: "مقدار تخفیف الزامی است" }),
  applicable_product_ids: z
    .array(
      z.object({
        product_id: z.string({ message: "محصول الزامی است" }),
        variant_id: z.string({ message: "ورینت الزامی است" }),
        discount_type: z.enum(["fixed_amount", "percentage"], {
          message: "نوع تخفیف الزامی است",
        }),
        discount_value: z
          .number({ message: "مقدار تخفیف الزامی است" })
          .min(1, { message: "مقدار تخفیف باید بیشتر از صفر باشد" }),
      })
    )
    .optional(),
  type: z
    .string({ message: "لطفا یک نوع انتخاب کنید" })
    .nonempty("لطفا یک نوع انتخاب کنید"),
  minimum_purchase_amount: z.number().optional().nullable(),
  total_usage_limit: z.number().optional().nullable(),
  is_special: z.boolean().optional(),
  is_active: z.boolean(),
});
