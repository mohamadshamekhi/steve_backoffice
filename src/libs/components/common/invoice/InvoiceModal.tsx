"use client";

import { Button } from "libs/ui";
import { Modal } from "libs/ui/modal";
import { priceToWords } from "libs/utilities";
import Image from "next/image";
import logo from "../../../../../public/images/_general/logo.png";
import { InvoiceData } from "./invoice.types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData | null;
}

// TODO: replace with the real store contact info before going live
const STORE_INFO = {
  name: "موبایل استیو",
  subtitle: "مجموعه خدمات و فروشگاه",
  address: "ساری، خیابان جمهوری، جنب بانک مسکن",
  phones: ["09379377797", "09116660036"],
};

const formatPrice = (price?: number) => (price || 0).toLocaleString("fa-IR");

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fa-IR");

const InvoiceModal = ({ isOpen, onClose, data }: InvoiceModalProps) => {
  if (!data) return null;

  const remaining = data.total - (data.advancePaid || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} containerClassName="max-w-[900px]">
      <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-invoice, #printable-invoice * { visibility: visible; }
                    #printable-invoice { position: fixed; inset: 0; width: 100%; margin: 0; }
                    .no-print { display: none !important; }
                }
            `}</style>

      <div
        id="printable-invoice"
        dir="rtl"
        className="mt-6 rounded-lg border border-[#e6dfc9] bg-[#faf7ee] text-[#3a3226]"
      >
        <div
          className="h-3 w-full rounded-t-lg"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #b3372c 0 10px, #faf7ee 10px 20px)",
          }}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#c9bf9e] pb-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-[#c9bf9e] text-xs text-[#8a8066]">
              <Image
                src={logo}
                alt={STORE_INFO.name}
                width={64}
                height={64}
                className="opacity-80"
              />
            </div>

            <div className="flex-1 text-center">
              <p className="text-sm text-[#8a8066]">
                {STORE_INFO.subtitle} · فاکتور فروش
              </p>
              <h1 className="mt-1 text-3xl font-extrabold">
                {STORE_INFO.name}
              </h1>
            </div>

            <div className="overflow-hidden rounded-md border border-[#c9bf9e] text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[#c9bf9e] px-3 py-1.5">
                <span className="text-[#8a8066]">شماره فاکتور</span>
                <span className="font-bold">
                  {data.invoiceNumber || data.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-3 py-1.5">
                <span className="text-[#8a8066]">تاریخ</span>
                <span className="font-bold">{formatDate(data.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-md bg-[#f2edda] px-4 py-3 text-sm">
            <span>
              <span className="font-bold">فروشگاه :</span> {STORE_INFO.name}
            </span>
            <span dir="ltr">{STORE_INFO.phones.join(" · ")}</span>
            <span>{STORE_INFO.address}</span>
          </div>

          <div className="mt-3 space-y-1 rounded-md bg-[#f2edda] px-4 py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span>
                <span className="font-bold">خریدار :</span>{" "}
                {data.customer.name || "—"}
              </span>
              <span>
                شماره تماس : <span dir="ltr">{data.customer.phone || "—"}</span>
              </span>
              <span>
                کد اقتصادی : {data.customer.economicCode || "اختیاری"}
              </span>
            </div>
            <div>
              آدرس :{" "}
              {data.address
                ? `${data.address.province ?? ""}${data.address.city ? "، " + data.address.city : ""}${data.address.street ? "، " + data.address.street : ""}`
                : "—"}
            </div>
          </div>

          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#c9bf9e] bg-[#f2edda]">
                <th className="w-10 border border-[#e6dfc9] py-2">ردیف</th>
                <th className="border border-[#e6dfc9] py-2">شرح کالا</th>
                <th className="w-16 border border-[#e6dfc9] py-2">تعداد</th>
                <th className="w-28 border border-[#e6dfc9] py-2">
                  فی (تومان)
                </th>
                <th className="w-24 border border-[#e6dfc9] py-2">تخفیف</th>
                <th className="w-32 border border-[#e6dfc9] py-2">
                  مبلغ کل (تومان)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-[#e6dfc9] py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-[#e6dfc9] px-2 py-2">
                    {item.name}
                    {item.variant && (
                      <span className="block text-xs text-[#8a8066]">
                        {item.variant}
                      </span>
                    )}
                  </td>
                  <td className="border border-[#e6dfc9] py-2 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-[#e6dfc9] py-2 text-center">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="border border-[#e6dfc9] py-2 text-center">
                    {item.discount ? formatPrice(item.discount) : "-"}
                  </td>
                  <td className="border border-[#e6dfc9] py-2 text-center">
                    {formatPrice(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-2 rounded-md bg-[#f2edda] px-4 py-3 text-sm">
            {(!!data.discount || !!data.shippingCost) && (
              <div className="space-y-1.5 border-b border-dashed border-[#c9bf9e] pb-2">
                <div className="flex items-center justify-between">
                  <span>جمع کل اقلام</span>
                  <span>{formatPrice(data.subtotal)}</span>
                </div>
                {!!data.discount && (
                  <div className="flex items-center justify-between">
                    <span>
                      تخفیف
                      {data.discountCode && (
                        <span className="mr-1 text-xs text-[#8a8066]">
                          (کد{" "}
                          <span dir="ltr" className="font-mono">
                            {data.discountCode}
                          </span>
                          )
                        </span>
                      )}
                    </span>
                    <span>−{formatPrice(data.discount)}</span>
                  </div>
                )}
                {!!data.shippingCost && (
                  <div className="flex items-center justify-between">
                    <span>
                      هزینه ارسال
                      {data.shippingName && (
                        <span className="mr-1 text-xs text-[#8a8066]">({data.shippingName})</span>
                      )}
                    </span>
                    <span>{formatPrice(data.shippingCost)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-bold">
                {data.discount || data.shippingCost ? "مبلغ قابل پرداخت (تومان)" : "قیمت کل (تومان)"}
              </span>
              <span className="font-bold">{formatPrice(data.total)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-[#c9bf9e] pt-2 text-xs text-[#8a8066]">
              <span>مبلغ به حروف :</span>
              <span>{priceToWords(data.total)}</span>
            </div>
          </div>

          {data.note && (
            <div className="mt-4 rounded-md border border-dashed border-[#c9bf9e] px-4 py-3 text-sm">
              <p className="mb-1 font-bold">توضیحات</p>
              <p className="text-[#8a8066]">{data.note}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm">
            <div className="border-t border-[#3a3226] pt-2">
              مهر و امضاء خریدار
            </div>
            <div className="border-t border-[#3a3226] pt-2">
              مهر و امضاء فروشنده
            </div>
          </div>
        </div>
      </div>

      <div className="no-print mt-6 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          بستن
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          چاپ فاکتور
        </Button>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
