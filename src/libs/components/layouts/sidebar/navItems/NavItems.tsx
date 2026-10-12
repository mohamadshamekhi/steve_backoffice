import GridIcon from "libs/components/icons/GridIcon";
import UserCircleIcon from "libs/components/icons/UserCircleIcon";
import ROUTES from "libs/constants/routes/routes.constants";
import NavItem from "types/sidebar/navItem.types";
import {
  AttributesIcon,
  BookIcon,
  BrandIcon,
  CartIcon,
  CategoryIcon,
  CommentIcon,
  DiscountIcon,
  OrderIcon,
  SellIcon,
  SettingIcon,
  SettingTabIcon,
  ShoppingIcon,
  StructureIcon,
  WalletIcon,
  WarehouseIcon,
} from "../../../icons";

// Items are grouped by `section`; the sidebar prints a heading whenever the section changes,
// so keep items of the same section next to each other.
export const navItems: NavItem[] = [
  {
    section: "منو",
    icon: <GridIcon />,
    name: "داشبورد",
    path: ROUTES.Dashboard,
  },

  /* ---------------------------------- فروش ---------------------------------- */
  {
    section: "فروش",
    icon: <OrderIcon />,
    name: "سفارشات",
    subItems: [
      { name: "لیست سفارشات", path: ROUTES.Orders, pro: false, permission: "order:list" },
      { name: "ثبت خرید حضوری", path: ROUTES.InStoreSale, pro: false },
    ],
  },
  {
    section: "فروش",
    icon: <CartIcon />,
    name: "سبد خرید",
    subItems: [{ name: "لیست سبد خرید", path: ROUTES.Carts, pro: false }],
  },
  {
    section: "فروش",
    icon: <DiscountIcon />,
    name: "تخفیف",
    subItems: [
      { name: "لیست تخفیف ها", path: ROUTES.Discount, pro: false },
      { name: "درج تخفیف", path: ROUTES.CreateDiscount },
    ],
  },
  {
    section: "فروش",
    icon: <DiscountIcon />,
    name: "ریفرال",
    permission: "referral:list",
    roles: ["super_admin", "marketing_manager"],
    subItems: [
      {
        name: "لیدربرد دعوت‌ها",
        path: ROUTES.Referral,
        permission: "referral:list",
        roles: ["super_admin", "marketing_manager"],
      },
      {
        name: "تنظیمات تخفیف",
        path: ROUTES.ReferralSettings,
        permission: "referral:manage",
        roles: ["super_admin", "marketing_manager"],
      },
    ],
  },
  {
    section: "فروش",
    icon: <DiscountIcon />,
    name: "بازبینی قیمت",
    permission: "price-review:view",
    subItems: [
      {
        name: "لیست بازبینی",
        path: ROUTES.PriceReview,
        permission: "price-review:view",
      },
      {
        name: "تنظیمات بازه",
        path: ROUTES.PriceReviewSettings,
        permission: "price-review:manage",
      },
    ],
  },

  /* ---------------------------- انبار و حسابداری ---------------------------- */
  {
    section: "انبار و حسابداری",
    icon: <WarehouseIcon />,
    name: "انبار",
    subItems: [
      {
        name: "موجودی انبار",
        path: ROUTES.InventoryStock,
        permission: "report:inventory",
      },
      {
        name: "انبارگردانی",
        path: ROUTES.InventoryStocktake,
        permission: "report:inventory",
      },
      {
        name: "دفتر حرکت کالا",
        path: ROUTES.InventoryMovements,
        permission: "inventory:view",
      },
      {
        name: "تأمین‌کنندگان",
        path: ROUTES.Suppliers,
        permission: "supplier:list",
      },
      {
        name: "فاکتورهای خرید",
        path: ROUTES.Purchases,
        permission: "purchase:list",
      },
      {
        name: "ثبت فاکتور خرید",
        path: ROUTES.CreatePurchase,
        permission: "purchase:create",
      },
    ],
  },
  {
    section: "انبار و حسابداری",
    icon: <WalletIcon />,
    name: "حسابداری",
    subItems: [
      {
        name: "صندوق",
        path: ROUTES.Cash,
        permission: "cash:view",
      },
      {
        name: "هزینه‌ها",
        path: ROUTES.Expenses,
        permission: "expense:list",
      },
      {
        name: "مرجوعی‌ها",
        path: ROUTES.SalesReturns,
        permission: "sales_return:list",
      },
      {
        name: "حساب تأمین‌کنندگان",
        path: ROUTES.SupplierLedgerReport,
        permission: "report:supplier_ledger",
      },
      {
        name: "گزارش صندوق",
        path: ROUTES.CashReport,
        permission: "report:cash",
      },
      {
        name: "گزارش سود ناخالص",
        path: ROUTES.ProfitReport,
        permission: "report:profit",
      },
      {
        name: "صورت سود و زیان",
        path: ROUTES.ProfitLossReport,
        permission: "report:profit_loss",
      },
    ],
  },

  /* --------------------------------- کاتالوگ -------------------------------- */
  {
    section: "کاتالوگ",
    icon: <ShoppingIcon />,
    name: "محصولات",
    subItems: [
      { name: "لیست محصولات", path: ROUTES.Products, pro: false },
      { name: "درج محصولات", path: ROUTES.CreateProduct },
      { name: "درج خدمات", path: ROUTES.CreateService },
      {
        name: "اپدیت کردن قیمت گوشی و تبلت",
        path: ROUTES.UpdatePhoneTabletPrice,
      },
    ],
  },
  {
    section: "کاتالوگ",
    icon: <BrandIcon />,
    name: "برندها",
    subItems: [
      { name: "لیست برندها", path: ROUTES.Brand, pro: false },
      { name: "درج برند", path: ROUTES.CreateBrand },
    ],
  },
  {
    section: "کاتالوگ",
    icon: <CategoryIcon />,
    name: "دسته بندی ها",
    subItems: [
      { name: "لیست دسته بندی", path: ROUTES.Categories, pro: false },
      { name: "درج دسته بندی", path: ROUTES.CreateCategory },
    ],
  },
  {
    section: "کاتالوگ",
    icon: <StructureIcon />,
    name: "ساختار ویژگی",
    subItems: [
      {
        name: "لیست ساختار ویژگی",
        path: ROUTES.AttributeDefinition,
      },
      { name: "درج ساختار ویژگی", path: ROUTES.CreateAttributeDefinition },
    ],
  },
  {
    section: "کاتالوگ",
    icon: <AttributesIcon />,
    name: "ویژگی ها",
    subItems: [
      { name: "لیست ویژگی", path: ROUTES.Attributes, pro: false },
      { name: "درج ویژگی", path: ROUTES.CreateAttribute },
    ],
  },

  /* ------------------------------ خدمات و همکاران ----------------------------- */
  {
    section: "خدمات و همکاران",
    icon: <SettingIcon />,
    name: "تعمیرات",
    subItems: [{ name: "لیست تعمیرات", path: ROUTES.Repairs, pro: false }],
  },
  {
    section: "خدمات و همکاران",
    icon: <SellIcon />,
    name: "فروش",
    subItems: [{ name: "لیست فروش", path: ROUTES.Sells, pro: false }],
  },
  {
    section: "خدمات و همکاران",
    icon: <UserCircleIcon />,
    name: "همکاران",
    subItems: [
      { name: "درخواست‌های همکاری", path: ROUTES.Partners, pro: false },
    ],
  },

  /* ------------------------------ فروشگاه همکار ------------------------------ */
  {
    section: "فروشگاه همکار",
    icon: <ShoppingIcon />,
    name: "لیست محصولات",
    path: ROUTES.PartnerShop,
    roles: ["partner"],
  },
  {
    section: "فروشگاه همکار",
    icon: <CartIcon />,
    name: "خریدهای من",
    path: ROUTES.PartnerShopMyOrders,
    roles: ["partner"],
  },

  /* ---------------------------------- محتوا --------------------------------- */
  {
    section: "محتوا",
    icon: <BookIcon />,
    name: "بلاگ ها",
    subItems: [
      { name: "لیست بلاگ", path: ROUTES.Blogs, pro: false },
      { name: "درج بلاگ", path: ROUTES.CreateBlog },
    ],
  },
  {
    section: "محتوا",
    icon: <CommentIcon />,
    name: "نظرات",
    subItems: [{ name: "لیست نظرات", path: ROUTES.Comment, pro: false }],
  },
  {
    section: "محتوا",
    icon: <CommentIcon />,
    name: "تماس با ما",
    subItems: [{ name: "لیست تماس با ما", path: ROUTES.ContactUs, pro: false }],
  },

  /* ---------------------------------- سیستم --------------------------------- */
  {
    section: "سیستم",
    icon: <UserCircleIcon />,
    name: "کاربران",
    subItems: [
      { name: "لیست کاربران", path: "/dashboard/users", pro: false },
      { name: "لیست کاربران ادمین", path: "/dashboard/admin" },
    ],
  },
  {
    section: "سیستم",
    icon: <SettingTabIcon />,
    name: "تنظیمات",
    subItems: [
      {
        name: "لیست نحوه ارسال",
        path: "/dashboard/setting/shipping",
      },
      { name: "بنرها", path: ROUTES.Banners, pro: false },
      {
        name: "لیست دسترسی‌ها",
        path: "/dashboard/setting/permissions",
      },
      { name: "لیست نقش‌ها", path: "/dashboard/setting/roles", pro: false },
    ],
  },
  {
    section: "سیستم",
    icon: <UserCircleIcon />,
    name: "پروفایل",
    path: "/dashboard/profile",
  },
];
