"use client";

import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "libs/api";
import ApiKeys from "libs/api/keys";
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

const orderStatusOptions = Object.entries(statusConfig).map(
  ([value, { label }]) => ({ value, label })
);

const List: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const limit = 10;

  const { data, isLoading, mutate } = useSWR(
    ApiKeys.GET_ALL_ORDER,
    (url: string) => fetcher(url, "dashboard", "GET")
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
      cell: ({ row }) => row.index + 1,
      enableSorting: true,
      maxSize: 50,
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
      accessorKey: "user_name",
      header: "مشتری",
      enableResizing: true,
      filterFn: "includesString",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">
            {row.original.user_name || (
              <span className="text-gray-400">بدون نام</span>
            )}
          </span>
          <span dir="ltr" className="text-xs text-gray-500">
            {row.original.user_phone_number}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "محصولات",
      cell: ({ row }) => {
        const items = row.original.items;
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.Quantity,
          0
        );
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm">{totalQuantity} کالا</span>
            <span className="line-clamp-1 text-xs text-gray-500">
              {items[0]?.ProductName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "shipping_address",
      header: "آدرس",
      cell: ({ row }) => {
        const address = row.original.shipping_address;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm">
              {address.city}، {address.province}
            </span>
            <span className="text-xs text-gray-500">
              {row.original.shipping?.name}
            </span>
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
          <div className="flex flex-col">
            <span className="font-medium text-green-600">
              {formatPrice(row.original.final_amount)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(row.original.subtotal_amount)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "تاریخ",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedOrder(row.original)}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          جزئیات
        </button>
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
              <h2 className="text-xl font-bold">جزئیات سفارش</h2>
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
    </ContentWrapper>
  );
};

export default List;
