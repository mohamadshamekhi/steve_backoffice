"use client";
import { Button, Input, Label } from "libs/ui";
import { Modal } from "libs/ui/modal";
import { toEnglishDigits } from "libs/utilities";
import { FormEvent, useEffect, useState } from "react";

// هم‌خوان با اعتبارسنجی بک‌اند: کد پست (عددی) یا کدهای حرفی/خط‌تیره‌دار سایر شرکت‌ها
const TRACKING_CODE_PATTERN = /^[A-Za-z0-9-]{4,64}$/;

type ShipOrderModalProps = {
  isOpen: boolean;
  orderId?: string;
  initialCode?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (trackingCode: string) => void;
};

const ShipOrderModal = ({
  isOpen,
  orderId,
  initialCode = "",
  loading = false,
  onClose,
  onSubmit,
}: ShipOrderModalProps) => {
  const [code, setCode] = useState(initialCode);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setTouched(false);
    }
  }, [isOpen, initialCode]);

  const trimmed = toEnglishDigits(code).trim();
  const isValid = TRACKING_CODE_PATTERN.test(trimmed);
  const showError = touched && !isValid;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || loading) return;
    onSubmit(trimmed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      containerClassName="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              ارسال سفارش
            </h3>
            {orderId && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                سفارش{" "}
                <span dir="ltr" className="font-mono">
                  #{orderId.slice(-6).toUpperCase()}
                </span>
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="tracking-code">کد رهگیری مرسوله</Label>
          <Input
            id="tracking-code"
            name="tracking_code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="مثلاً 123456789012345678901234"
            dir="ltr"
            numeric
            maxLength={64}
            error={showError}
            className="text-left font-mono tracking-wide"
            hint={
              showError
                ? trimmed
                  ? "کد رهگیری باید ۴ تا ۶۴ کاراکتر و فقط شامل عدد، حروف لاتین یا خط تیره باشد"
                  : "وارد کردن کد رهگیری الزامی است"
                : undefined
            }
            hintClass="text-error-500"
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-xs leading-6 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1 shrink-0"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          با ثبت، وضعیت سفارش «ارسال شده» می‌شود و کد رهگیری با پیامک برای
          خریدار ارسال می‌شود.
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            ثبت و ارسال پیامک
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ShipOrderModal;
