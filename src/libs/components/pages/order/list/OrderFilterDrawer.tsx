"use client";
import { CSelect, DatePicker, Input } from "libs/ui";
import MultiSelectInput from "libs/ui/multiSelect";
import { useEffect, useState } from "react";
import { DateObject } from "react-multi-date-picker";

export interface OrderFilters {
  statuses: string[];
  order_id: string;
  phone: string;
  is_partner_order: string;
  from: DateObject | null;
  to: DateObject | null;
  min_amount: string;
  max_amount: string;
}

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  statuses: [],
  order_id: "",
  phone: "",
  is_partner_order: "",
  from: null,
  to: null,
  min_amount: "",
  max_amount: "",
};

export const countActiveFilters = (f: OrderFilters) =>
  [
    f.statuses.length,
    f.order_id.trim(),
    f.phone.trim(),
    f.is_partner_order,
    f.from || f.to,
    f.min_amount || f.max_amount,
  ].filter(Boolean).length;

const PARTNER_OPTIONS = [
  { value: "", label: "همه" },
  { value: "true", label: "همکار" },
  { value: "false", label: "غیر همکار" },
];

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

interface OrderFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  value: OrderFilters;
  onApply: (filters: OrderFilters) => void;
  statusOptions: { value: string; label: string }[];
}

// فیلترها در پیش‌نویس محلی تغییر می‌کنند و فقط با «اعمال فیلتر» به لیست می‌روند
const OrderFilterDrawer = ({ isOpen, onClose, value, onApply, statusOptions }: OrderFilterDrawerProps) => {
  const [draft, setDraft] = useState<OrderFilters>(value);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const set = <K extends keyof OrderFilters>(key: K, v: OrderFilters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: v }));

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-99999 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="فیلتر سفارش‌ها"
        className={`absolute top-0 left-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">فیلتر سفارش‌ها</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label className={labelClass}>وضعیت</label>
            <MultiSelectInput
              name="status"
              options={statusOptions}
              value={draft.statuses}
              placeholder="همه وضعیت‌ها"
              onChange={(v) => set("statuses", v)}
            />
          </div>

          <div>
            <label className={labelClass}>شماره سفارش</label>
            <Input
              name="order_id"
              value={draft.order_id}
              placeholder="شناسه‌ی سفارش"
              onChange={(e) => set("order_id", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>موبایل مشتری</label>
            <Input
              name="phone"
              inputMode="numeric"
              dir="ltr"
              value={draft.phone}
              placeholder="0912..."
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>سفارش همکار</label>
            <CSelect
              name="is_partner_order"
              options={PARTNER_OPTIONS}
              value={draft.is_partner_order}
              onChange={(v) => set("is_partner_order", v)}
            />
          </div>

          <div>
            <label className={labelClass}>بازه‌ی تاریخ</label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker name="from" placeholder="از" value={draft.from} onChange={(v) => set("from", v)} />
              <DatePicker name="to" placeholder="تا" value={draft.to} onChange={(v) => set("to", v)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>بازه‌ی مبلغ (تومان)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="min_amount"
                type="number"
                min="0"
                placeholder="از"
                value={draft.min_amount}
                onChange={(e) => set("min_amount", e.target.value)}
              />
              <Input
                name="max_amount"
                type="number"
                min="0"
                placeholder="تا"
                value={draft.max_amount}
                onChange={(e) => set("max_amount", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setDraft(EMPTY_ORDER_FILTERS)}
            className="h-11 flex-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            پاک کردن
          </button>
          <button
            type="button"
            onClick={apply}
            className="h-11 flex-[2] rounded-lg bg-brand-500 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            اعمال فیلتر
          </button>
        </div>
      </aside>
    </div>
  );
};

export default OrderFilterDrawer;
