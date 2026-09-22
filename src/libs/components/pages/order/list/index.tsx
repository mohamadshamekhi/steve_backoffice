"use client";

import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "libs/api";
import ApiKeys from "libs/api/keys";
import { InvoiceModal } from "libs/components/common";
import { InvoiceData } from "libs/components/common/invoice/invoice.types";
import ContentWrapper from "libs/components/common/contentWrapper/ContentWrapper";
import Pagination from "libs/components/common/Pagination";
import { Badge, Table } from "libs/ui";
import { BadgeColor } from "libs/ui/badge/badge.types";
import { Modal } from "libs/ui/modal";
import { useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

interface OrderItem {
  ProductID: string;
  VariantID: string;
  Quantity: number;
  ProductName: string;
  VariantAttributes: { key: string; value: string; label: string }[];
  PriceAtTime: number;
  DiscountAmount?: number;
}

interface ShippingAddress {
  title: string;
  province: string;
  city: string;
  street: string;
  postcode: string;
}

interface Shipping {
  name: string;
  description: string;
  cost: number;
}

interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  gateway: string;
  status: string;
  gateway_transaction_id: string;
  tracking_code?: string;
  masked_card_number?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface OrderProps {
  id: string;
  status: string;
  user_id: string;
  user_name: string;
  user_phone_number: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  shipping: Shipping;
  payments: Payment[];
  subtotal_amount: number;
  shipping_amount: number;
  final_amount: number;
  applied_discounts: { discount_id: string; discount_code?: string; amount: number }[];
  /** کل تخفیف فاکتور (کد تخفیف + کمپین + تخفیف دستی) */
  total_discount_amount?: number;
  /** تخفیف کل فاکتور حضوری */
  manual_discount?: number;
  created_at: string;
  updated_at: string;
}

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

const formatPrice = (price: number): string => {
  return price.toLocaleString("fa-IR") + " تومان";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
        <path d="M5 13v7h14v-7" />
      </svg>
    ) : (
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    )}
    {inStore ? "حضوری" : "آنلاین"}
  </span>
);

const orderStatusOptions = Object.entries(statusConfig).map(
  ([value, { label }]) => ({ value, label })
);

const List: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        totalPrice: item.PriceAtTime * item.Quantity - (item.DiscountAmount || 0),
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
    [ApiKeys.GET_ALL_ORDER(page, limit)],
    ([url]: [string]) => fetcher(url, "dashboard", "GET")
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
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {name ? name.trim().charAt(0).toUpperCase() : "?"}
            </span>
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
              <span dir="ltr" className="text-xs text-gray-500 [text-align:right]">
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
        const totalQuantity = items.reduce((sum, item) => sum + item.Quantity, 0);
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
          return <span className="text-sm text-gray-500">تحویل در فروشگاه</span>;
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
        return <Badge color={config.color}>{config.label}</Badge>;
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
              {d.toLocaleDateString("fa-IR", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-xs text-gray-400">
              {d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="جزئیات سفارش"
            aria-label="جزئیات سفارش"
            onClick={() => setSelectedOrder(row.original)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            title="فاکتور"
            aria-label="فاکتور"
            onClick={() => setInvoiceOrder(buildInvoice(row.original))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-brand-500/20 dark:bg-brand-500/15 dark:text-brand-400"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V3h12v6" />
              <rect x="3" y="9" width="18" height="8" rx="2" />
              <path d="M6 14h12v7H6z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <ContentWrapper title="لیست سفارشات">
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
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">جزئیات سفارش</h2>
                <ChannelBadge inStore={isInStore(selectedOrder)} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrder(buildInvoice(selectedOrder))}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400"
                >
                  چاپ فاکتور
                </button>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleStatusChange(selectedOrder.id, e.target.value)
                }
                disabled={updatingStatus}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                {orderStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                  اطلاعات مشتری
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">نام:</span>{" "}
                    {selectedOrder.user_name || "بدون نام"}
                  </p>
                  <p>
                    <span className="text-gray-500">شماره تماس:</span>{" "}
                    <span dir="ltr">{selectedOrder.user_phone_number}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                  آدرس ارسال
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">عنوان:</span>{" "}
                    {selectedOrder.shipping_address.title}
                  </p>
                  <p>
                    <span className="text-gray-500">آدرس:</span>{" "}
                    {selectedOrder.shipping_address.province}،{" "}
                    {selectedOrder.shipping_address.city}،{" "}
                    {selectedOrder.shipping_address.street}
                  </p>
                  <p>
                    <span className="text-gray-500">کد پستی:</span>{" "}
                    {selectedOrder.shipping_address.postcode}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                محصولات
              </h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.ProductName}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.VariantAttributes.map((attr, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700"
                          >
                            {attr.key}:{" "}
                            {attr.value.startsWith("#") ? (
                              <span
                                className="inline-block h-3 w-3 rounded-full border"
                                style={{ backgroundColor: attr.value }}
                              />
                            ) : null}
                            {attr.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">
                        تعداد: {item.Quantity}
                      </p>
                      <p className="font-medium">
                        {formatPrice(item.PriceAtTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                روش ارسال
              </h3>
              <p className="text-sm">
                {selectedOrder.shipping?.name} -{" "}
                {selectedOrder.shipping?.description}
              </p>
              <p className="text-sm text-gray-500">
                هزینه ارسال: {formatPrice(selectedOrder.shipping?.cost || 0)}
              </p>
            </div>

            {selectedOrder.payments?.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                  پرداخت‌ها
                </h3>
                <div className="space-y-2">
                  {selectedOrder.payments.map((payment) => {
                    const pConfig = paymentStatusConfig[payment.status] || {
                      label: payment.status,
                      color: "light" as BadgeColor,
                    };
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge color={pConfig.color}>{pConfig.label}</Badge>
                            <span className="text-xs text-gray-500">
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
                            <span dir="ltr" className="text-xs text-gray-500">
                              {payment.masked_card_number}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatPrice(payment.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">جمع کل:</span>
                <span>{formatPrice(selectedOrder.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">هزینه ارسال:</span>
                <span>{formatPrice(selectedOrder.shipping?.cost || 0)}</span>
              </div>
              {selectedOrder.final_amount < selectedOrder.subtotal_amount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>تخفیف:</span>
                  <span>
                    {formatPrice(
                      selectedOrder.subtotal_amount - selectedOrder.final_amount
                    )}
                    -
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                <span>مبلغ نهایی:</span>
                <span className="text-green-600">
                  {formatPrice(selectedOrder.final_amount)}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              <p>تاریخ ثبت: {formatDate(selectedOrder.created_at)}</p>
              <p>آخرین بروزرسانی: {formatDate(selectedOrder.updated_at)}</p>
            </div>
          </div>
        )}
      </Modal>

      <InvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        data={invoiceOrder}
      />
    </ContentWrapper>
  );
};

export default List;
