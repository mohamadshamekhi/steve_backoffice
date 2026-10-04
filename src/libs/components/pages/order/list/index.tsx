"use client";

import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "libs/api";
import Image from "next/image";
import noPic from "../../../../../../public/images/placeholder/no-pic.png";
import ApiKeys from "libs/api/keys";
import { InvoiceModal, QrLabelModal } from "libs/components/common";
import { InvoiceData } from "libs/components/common/invoice/invoice.types";
import ContentWrapper from "libs/components/common/contentWrapper/ContentWrapper";
import Pagination from "libs/components/common/Pagination";
import { toIsoDate } from "libs/constants/warehouse/warehouse.constants";
import { Badge, Table } from "libs/ui";
import { BadgeColor } from "libs/ui/badge/badge.types";
import { usePermission } from "libs/hooks/usePermission";
import { Modal } from "libs/ui/modal";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import EditOrderModal from "../edit";
import EditHistory from "../edit/EditHistory";
import {
  ORDER_EDIT,
  OrderProps,
  formatDate,
  formatPrice,
} from "../order.types";
import OrderFilterDrawer, {
  countActiveFilters,
  EMPTY_ORDER_FILTERS,
  OrderFilters,
} from "./OrderFilterDrawer";

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  pending_payment: { label: "در انتظار پرداخت", color: "warning" },
  processing: { label: "در حال پردازش", color: "info" },
  shipped: { label: "ارسال شده", color: "primary" },
  delivered: { label: "تحویل داده شده", color: "success" },
  cancelled: { label: "لغو شده", color: "error" },
  refunded: { label: "مرجوع شده", color: "dark" },
};

const paymentStatusConfig: Record<
  string,
  { label: string; color: BadgeColor }
> = {
  pending: { label: "در انتظار پرداخت", color: "warning" },
  successful: { label: "موفق", color: "success" },
  failed: { label: "ناموفق", color: "error" },
  refunded: { label: "مسترد شده", color: "dark" },
  in_person: { label: "خرید حضوری", color: "light" },
};

const isInStore = (o: OrderProps) =>
  !!o.payments?.some((p) => p.gateway === "in_person");

const ChannelBadge = ({ inStore }: { inStore: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
      inStore
        ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
        : "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20"
    }`}
  >
    {inStore ? (
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
        <path d="M5 13v7h14v-7" />
      </svg>
    ) : (
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    )}
    {inStore ? "حضوری" : "آنلاین"}
  </span>
);

const EditedTag = () => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700 ring-1 ring-inset ring-warning-200 dark:bg-warning-500/10 dark:text-warning-400 dark:ring-warning-500/20">
    <svg
      aria-hidden
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
    ویرایش‌شده
  </span>
);

const svg = (d: React.ReactNode) => (
  <svg
    aria-hidden
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const ICONS = {
  view: svg(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  edit: svg(<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />),
  qr: svg(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </>
  ),
  print: svg(
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M6 14h12v7H6z" />
    </>
  ),
};

type RowAction = { label: string; icon: React.ReactNode; onClick: () => void };

// منو با position: fixed باز می‌شود تا overflow جدول آن را نبرد
const RowActions = ({
  label,
  actions,
}: {
  label: string;
  actions: RowAction[];
}) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const MENU_W = 176;

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t))
        close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    menuRef.current?.querySelector("button")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const toggle = () => {
    if (pos) return setPos(null);
    const r = btnRef.current!.getBoundingClientRect();
    const menuH = actions.length * 40 + 8;
    const top =
      r.bottom + 4 + menuH > window.innerHeight
        ? r.top - 4 - menuH
        : r.bottom + 4;
    setPos({ top, left: Math.max(8, r.left) });
  };

  return (
    <div className="flex justify-end">
      <button
        ref={btnRef}
        type="button"
        title="عملیات"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        onClick={toggle}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
          pos
            ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/15 dark:text-brand-400"
            : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
      >
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {pos && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: pos.top, left: pos.left, width: MENU_W }}
          className="shadow-theme-lg fixed z-50 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900"
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setPos(null);
                a.onClick();
              }}
              className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none dark:text-gray-300 dark:hover:bg-white/[0.05] dark:focus-visible:bg-white/[0.05]"
            >
              <span className="text-gray-400">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const orderStatusOptions = Object.entries(statusConfig).map(
  ([value, { label }]) => ({ value, label })
);

const PURCHASE_TYPE_OPTIONS = [
  { value: "", label: "همه" },
  { value: "online", label: "آنلاین" },
  { value: "in_person", label: "حضوری" },
];

type SegmentedItem = { value: string; label: string; dot?: string };

const SegmentedTabs = ({
  label,
  items,
  value,
  onChange,
  className = "",
}: {
  label: string;
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div
    role="tablist"
    aria-label={label}
    className={`flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 [scrollbar-width:thin] dark:bg-gray-900 ${className}`}
  >
    {items.map((item) => {
      const active = value === item.value;
      return (
        <button
          key={item.value || "all"}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(item.value)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
            active
              ? "shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.06] dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {item.dot && (
            <span aria-hidden className={`h-2 w-2 rounded-full ${item.dot}`} />
          )}
          {item.label}
        </button>
      );
    })}
  </div>
);

const List: React.FC = () => {
  const [page, setPage] = useState(1);
  const [purchaseType, setPurchaseType] = useState("");
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_ORDER_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters);

  const filterParams: Record<string, string> = {
    ...(purchaseType && { purchase_type: purchaseType }),
    ...(filters.statuses.length && { status: filters.statuses.join(",") }),
    ...(filters.order_id.trim() && { order_id: filters.order_id.trim() }),
    ...(filters.phone.trim() && { phone: filters.phone.trim() }),
    ...(filters.is_partner_order && {
      is_partner_order: filters.is_partner_order,
    }),
    ...(filters.from && { from: toIsoDate(filters.from.toDate()) }),
    ...(filters.to && { to: toIsoDate(filters.to.toDate()) }),
    ...(filters.min_amount && { min_amount: filters.min_amount }),
    ...(filters.max_amount && { max_amount: filters.max_amount }),
  };

  const closeFilter = useCallback(() => setFilterOpen(false), []);

  const applyFilters = (next: OrderFilters) => {
    setFilters(next);
    setPage(1);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceData | null>(null);
  const [qrOrder, setQrOrder] = useState<OrderProps | null>(null);
  const [qrImage, setQrImage] = useState("");

  // QR تحویل برای چسباندن روی بسته‌ی سفارش آنلاین؛ مشتری با اسکن آن سفارش را می‌بیند و تحویل را تأیید می‌کند
  const openDeliveryQr = async (o: OrderProps) => {
    setQrImage("");
    setQrOrder(o);
    try {
      const res = await fetcher(
        ApiKeys.GET_ORDER_DELIVERY_QRCODE(o.id),
        "dashboard",
        "GET"
      );
      if (res?.data?.qr_code) setQrImage(res.data.qr_code);
      else throw new Error();
    } catch {
      toast.error("ساخت QR تحویل ناموفق بود");
      setQrOrder(null);
    }
  };
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const canEdit = usePermission(ORDER_EDIT);
  const [editingOrder, setEditingOrder] = useState<OrderProps | null>(null);

  // endpoint تکی سفارش نداریم؛ نسخه‌ی تازه از لیست با فیلتر order_id گرفته می‌شود و
  // چون key فرم به updated_at بسته است، فرم با داده‌ی جدید از نو ساخته می‌شود
  const reloadEditingOrder = async () => {
    if (!editingOrder) return;
    const res = await fetcher(ApiKeys.GET_ALL_ORDER(1, 1), "dashboard", "GET", {
      params: { order_id: editingOrder.id },
    });
    const fresh: OrderProps | undefined = res?.data?.orders?.[0];
    mutate();
    if (fresh) {
      setEditingOrder(fresh);
      setSelectedOrder(fresh);
    } else {
      setEditingOrder(null);
    }
  };

  const buildInvoice = (o: OrderProps): InvoiceData => {
    const hasInPersonPayment = isInStore(o);
    return {
      orderId: o.id,
      createdAt: o.created_at,
      type: hasInPersonPayment ? "in_person" : "online",
      customer: { name: o.user_name, phone: o.user_phone_number },
      address: hasInPersonPayment ? undefined : o.shipping_address,
      shippingName: o.shipping?.name,
      items: o.items.map((item) => ({
        name: item.ProductName,
        variant: item.VariantAttributes?.map((a) => a.label).join("، "),
        quantity: item.Quantity,
        unitPrice: item.PriceAtTime,
        discount: item.DiscountAmount || undefined,
        totalPrice:
          item.PriceAtTime * item.Quantity - (item.DiscountAmount || 0),
      })),
      subtotal: o.subtotal_amount,
      shippingCost: o.shipping_amount || o.shipping?.cost,
      discount: o.total_discount_amount || undefined,
      discountCode:
        o.applied_discounts
          ?.map((d) => d.discount_code)
          .filter(Boolean)
          .join("، ") || undefined,
      total: o.final_amount,
      advancePaid: o.payments
        ?.filter((p) => p.status === "successful")
        .reduce((sum, p) => sum + p.amount, 0),
      paymentMethod: hasInPersonPayment
        ? "نقدی / حضوری"
        : paymentStatusConfig[o.payments?.[0]?.status]?.label,
    };
  };

  const limit = 10;

  const { data, isLoading, mutate } = useSWR(
    [ApiKeys.GET_ALL_ORDER(page, limit), JSON.stringify(filterParams)],
    ([url, params]: [string, string]) =>
      fetcher(url, "dashboard", "GET", { params: JSON.parse(params) })
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetcher(
        ApiKeys.UPDATE_ORDER_STATUS(orderId),
        "dashboard",
        "PATCH",
        {
          body: { status: newStatus },
        }
      );
      if (res?.success) {
        toast.success("وضعیت سفارش بروزرسانی شد");
        mutate();
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns: ColumnDef<OrderProps>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {((page - 1) * limit + row.index + 1).toLocaleString("fa-IR")}
          </span>
          <span dir="ltr" className="font-mono text-[11px] text-gray-400">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        </div>
      ),
      enableSorting: true,
      maxSize: 70,
    },
    {
      id: "channel",
      header: "کانال فروش",
      accessorFn: (o) => (isInStore(o) ? "in_person" : "online"),
      cell: ({ row }) => <ChannelBadge inStore={isInStore(row.original)} />,
    },
    {
      accessorKey: "user_name",
      header: "مشتری",
      enableResizing: true,
      filterFn: "includesString",
      enableSorting: true,
      cell: ({ row }) => {
        const name = row.original.user_name;
        return (
          <div className="flex items-center gap-3">
            {/* <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {name ? name.trim().charAt(0).toUpperCase() : "?"}
            </span> */}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className={
                  name
                    ? "truncate text-sm font-medium text-gray-800 dark:text-white/90"
                    : "text-sm text-gray-400"
                }
              >
                {name || "بدون نام"}
              </span>
              <span
                dir="ltr"
                className="text-xs text-gray-500 [text-align:right]"
              >
                {row.original.user_phone_number}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "محصولات",
      cell: ({ row }) => {
        const items = row.original.items ?? [];
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.Quantity,
          0
        );
        if (!items.length)
          return <span className="text-xs text-gray-400">بدون کالا</span>;
        return (
          <div className="flex max-w-[220px] flex-col gap-1">
            <span className="line-clamp-1 text-sm text-gray-700 dark:text-gray-300">
              {items[0].ProductName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{totalQuantity.toLocaleString("fa-IR")} کالا</span>
              {items.length > 1 && (
                <span className="rounded-full bg-gray-100 px-1.5 py-px text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  +{(items.length - 1).toLocaleString("fa-IR")} قلم دیگر
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "shipping_address",
      header: "ارسال",
      cell: ({ row }) => {
        const o = row.original;
        if (isInStore(o))
          return (
            <span className="text-sm text-gray-500">تحویل در فروشگاه</span>
          );
        const place = [o.shipping_address?.city, o.shipping_address?.province]
          .filter(Boolean)
          .join("، ");
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {place || <span className="text-gray-400">بدون آدرس</span>}
            </span>
            {o.shipping?.name && (
              <span className="text-xs text-gray-500">{o.shipping.name}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "final_amount",
      header: "مبلغ",
      cell: ({ row }) => {
        const hasDiscount =
          row.original.final_amount < row.original.subtotal_amount;
        return (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-sm font-semibold text-gray-800 tabular-nums dark:text-white/90">
              {formatPrice(row.original.final_amount)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through tabular-nums">
                {formatPrice(row.original.subtotal_amount)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || {
          label: status,
          color: "light" as BadgeColor,
        };
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge color={config.color}>{config.label}</Badge>
            {row.original.is_edited && <EditedTag />}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "تاریخ",
      cell: ({ row }) => {
        const d = new Date(row.original.created_at);
        return (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {d.toLocaleDateString("fa-IR", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-400">
              {d.toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <RowActions
            label={`عملیات سفارش ${o.id.slice(-6).toUpperCase()}`}
            actions={[
              {
                label: "جزئیات سفارش",
                icon: ICONS.view,
                onClick: () => setSelectedOrder(o),
              },
              ...(canEdit
                ? [
                    {
                      label: "ویرایش سفارش",
                      icon: ICONS.edit,
                      onClick: () => setEditingOrder(o),
                    },
                  ]
                : []),
              ...(!isInStore(o)
                ? [
                    {
                      label: "QR تحویل",
                      icon: ICONS.qr,
                      onClick: () => openDeliveryQr(o),
                    },
                  ]
                : []),
              {
                label: "چاپ فاکتور",
                icon: ICONS.print,
                onClick: () => setInvoiceOrder(buildInvoice(o)),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <ContentWrapper title="لیست سفارشات">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          label="نوع خرید"
          className="max-w-full"
          value={purchaseType}
          onChange={(v) => {
            setPurchaseType(v);
            setPage(1);
          }}
          items={PURCHASE_TYPE_OPTIONS}
        />
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => applyFilters(EMPTY_ORDER_FILTERS)}
              className="h-10 rounded-lg px-3 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-red-500/10"
            >
              حذف فیلترها
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-haspopup="dialog"
            className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
              activeFilterCount > 0
                ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/15 dark:text-brand-400"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5h18M6 12h12M10 19h4" />
            </svg>
            فیلترها
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <OrderFilterDrawer
        isOpen={filterOpen}
        onClose={closeFilter}
        value={filters}
        onApply={applyFilters}
        statusOptions={orderStatusOptions}
      />

      <div className="relative">
        <Table<OrderProps>
          headerClass="text-nowrap"
          columns={columns}
          data={data?.data?.orders ?? []}
          loading={isLoading}
        />
      </div>

      <Pagination
        currentPage={page}
        total={data?.data?.pagination.total ?? 0}
        pageSize={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <div className="mt-6 space-y-5">
            {/* ─── Header ─── */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                    جزئیات سفارش
                  </h2>
                  <ChannelBadge inStore={isInStore(selectedOrder)} />
                  {selectedOrder.is_edited && <EditedTag />}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <svg
                    aria-hidden
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span>ثبت: {formatDate(selectedOrder.created_at)}</span>
                  {selectedOrder.updated_at !== selectedOrder.created_at && (
                    <>
                      <span>·</span>
                      <span>بروز: {formatDate(selectedOrder.updated_at)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  disabled={updatingStatus}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  {orderStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditingOrder(selectedOrder)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg
                      aria-hidden
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    ویرایش
                  </button>
                )}
                <button
                  onClick={() => setInvoiceOrder(buildInvoice(selectedOrder))}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  <svg
                    aria-hidden
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9V3h12v6" />
                    <rect x="3" y="9" width="18" height="8" rx="2" />
                    <path d="M6 14h12v7H6z" />
                  </svg>
                  چاپ فاکتور
                </button>
              </div>
            </div>

            {/* ─── Customer + Address ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/60">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <svg
                      aria-hidden
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    اطلاعات مشتری
                  </h3>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <dt className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      نام
                    </dt>
                    <dd className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedOrder.user_name || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      تماس
                    </dt>
                    <dd
                      dir="ltr"
                      className="font-medium tracking-wide text-gray-800 dark:text-gray-200"
                    >
                      {selectedOrder.user_phone_number}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/60">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                    <svg
                      aria-hidden
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    آدرس ارسال
                  </h3>
                </div>
                <dl className="space-y-2 text-sm">
                  {selectedOrder.shipping_address.title && (
                    <div className="flex items-start gap-2">
                      <dt className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        عنوان
                      </dt>
                      <dd className="text-gray-700 dark:text-gray-300">
                        {selectedOrder.shipping_address.title}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <dt className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      آدرس
                    </dt>
                    <dd className="text-gray-700 dark:text-gray-300">
                      {[
                        selectedOrder.shipping_address.province,
                        selectedOrder.shipping_address.city,
                        selectedOrder.shipping_address.street,
                      ]
                        .filter(Boolean)
                        .join("، ")}
                    </dd>
                  </div>
                  {selectedOrder.shipping_address.postcode && (
                    <div className="flex items-center gap-2">
                      <dt className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        کد پستی
                      </dt>
                      <dd
                        dir="ltr"
                        className="font-mono text-xs text-gray-600 dark:text-gray-400"
                      >
                        {selectedOrder.shipping_address.postcode}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* ─── Products ─── */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                  <svg
                    aria-hidden
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" />
                  </svg>
                </span>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  محصولات
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {selectedOrder.items.length} آیتم
                </span>
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700/50 dark:bg-gray-800/40"
                  >

                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <Image
                        src={item.ProductThumbnailURL || noPic}
                        alt={item.ProductName}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = noPic.src;
                        }}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                        {item.ProductName}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(item.VariantAttributes ?? []).map((attr, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          >
                            {attr.key}:{" "}
                            {attr.value.startsWith("#") && (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300"
                                style={{ backgroundColor: attr.value }}
                              />
                            )}
                            {attr.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="mb-0.5 text-right text-xs text-gray-400 dark:text-gray-500">
                        × {item.Quantity}
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatPrice(item.PriceAtTime)}
                      </p>
                      {item.DiscountAmount ? (
                        <p className="text-right text-xs text-green-600 dark:text-green-400">
                          − {formatPrice(item.DiscountAmount)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Shipping ─── */}
            {selectedOrder.shipping && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700/50 dark:bg-gray-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                    <svg
                      aria-hidden
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                      <rect x="9" y="11" width="14" height="10" rx="1" />
                      <circle cx="12" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {selectedOrder.shipping.name || "—"}
                    </p>
                    {selectedOrder.shipping.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {selectedOrder.shipping.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatPrice(selectedOrder.shipping.cost || 0)}
                </span>
              </div>
            )}

            {/* ─── Payments ─── */}
            {selectedOrder.payments?.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <svg
                      aria-hidden
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <path d="M1 10h22" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    پرداخت‌ها
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedOrder.payments.map((payment) => {
                    const pConfig = paymentStatusConfig[payment.status] || {
                      label: payment.status,
                      color: "light" as BadgeColor,
                    };
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-700/50 dark:bg-gray-800/40"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge color={pConfig.color}>{pConfig.label}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.gateway === "in_person"
                                ? "خرید حضوری از فروشگاه"
                                : payment.gateway}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(payment.created_at)}
                          </span>
                          {payment.tracking_code && (
                            <span className="text-xs text-gray-500">
                              کد پیگیری: {payment.tracking_code}
                            </span>
                          )}
                          {payment.masked_card_number && (
                            <span
                              dir="ltr"
                              className="font-mono text-xs text-gray-500"
                            >
                              {payment.masked_card_number}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {formatPrice(payment.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Totals ─── */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/60">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>جمع کل</span>
                  <span>{formatPrice(selectedOrder.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>هزینه ارسال</span>
                  <span>{formatPrice(selectedOrder.shipping?.cost || 0)}</span>
                </div>
                {selectedOrder.final_amount < selectedOrder.subtotal_amount && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>تخفیف</span>
                    <span>
                      −{" "}
                      {formatPrice(
                        selectedOrder.subtotal_amount -
                          selectedOrder.final_amount
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                  مبلغ نهایی
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPrice(selectedOrder.final_amount)}
                </span>
              </div>
            </div>

            <EditHistory edits={selectedOrder.edits} />
          </div>
        )}
      </Modal>

      <EditOrderModal
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSaved={() => {
          setEditingOrder(null);
          setSelectedOrder(null);
          mutate();
        }}
        onConflict={reloadEditingOrder}
      />

      <InvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        data={invoiceOrder}
      />

      <QrLabelModal
        isOpen={!!qrOrder}
        onClose={() => setQrOrder(null)}
        image={qrImage}
        loading={!qrImage}
        caption={qrOrder ? `سفارش #${qrOrder.id.slice(-8)}` : ""}
        fileName={`delivery-qr-${qrOrder?.id ?? ""}`}
      />
    </ContentWrapper>
  );
};

export default List;
