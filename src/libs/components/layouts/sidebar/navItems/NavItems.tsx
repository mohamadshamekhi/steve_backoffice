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
} from "../../../icons";

export const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "داشبورد",
    path: ROUTES.Dashboard,
  },
  {
    icon: <BrandIcon />,
    name: "برندها",
    subItems: [
      { name: "لیست برندها", path: ROUTES.Brand, pro: false },
      { name: "درج برند", path: ROUTES.CreateBrand },
    ],
  },
  {
    icon: <CategoryIcon />,
    name: "دسته بندی ها",
    subItems: [
      { name: "لیست دسته بندی", path: ROUTES.Categories, pro: false },
      { name: "درج دسته بندی", path: ROUTES.CreateCategory },
    ],
  },
  {
    icon: <ShoppingIcon />,
    name: "محصولات",
    subItems: [
      { name: "لیست محصولات", path: ROUTES.Products, pro: false },
      { name: "درج محصولات", path: ROUTES.CreateProduct },
      {
        name: "اپدیت کردن قیمت گوشی و تبلت",
        path: ROUTES.UpdatePhoneTabletPrice,
      },
    ],
  },
  {
    icon: <CartIcon />,
    name: "سبد خرید",
    subItems: [{ name: "لیست سبد خرید", path: ROUTES.Carts, pro: false }],
  },
  {
    icon: <OrderIcon />,
    name: "سفارشات",
    subItems: [
      { name: "لیست سفارشات", path: ROUTES.Orders, pro: false },
      { name: "ثبت خرید حضوری", path: ROUTES.InStoreSale, pro: false },
    ],
  },
  {
    icon: <DiscountIcon />,
    name: "تخفیف",
    subItems: [
      { name: "لیست تخفیف ها", path: ROUTES.Discount, pro: false },
      { name: "درج تخفیف", path: ROUTES.CreateDiscount },
    ],
  },
  {
    icon: <StructureIcon />,
    name: "ساختار ویژگی",
    subItems: [
      {
        name: "لیست ساختار ویژگی",
        path: ROUTES.AttributeDefinition,
        pro: false,
      },
      { name: "درج ساختار ویژگی", path: ROUTES.CreateAttributeDefinition },
    ],
  },
  {
    icon: <AttributesIcon />,
    name: "ویژگی ها",
    subItems: [
      { name: "لیست ویژگی", path: ROUTES.Attributes, pro: false },
      { name: "درج ویژگی", path: ROUTES.CreateAttribute },
    ],
  },
  {
    icon: <SettingIcon />,
    name: "تعمیرات",
    subItems: [{ name: "لیست تعمیرات", path: ROUTES.Repairs, pro: false }],
  },
  {
    icon: <SellIcon />,
    name: "فروش",
    subItems: [{ name: "لیست فروش", path: ROUTES.Sells, pro: false }],
  },
  {
    icon: <BookIcon />,
    name: "بلاگ ها",
    subItems: [
      { name: "لیست بلاگ", path: ROUTES.Blogs, pro: false },
      { name: "درج بلاگ", path: ROUTES.CreateBlog },
    ],
  },
  {
    icon: <CommentIcon />,
    name: "نظرات",
    subItems: [{ name: "لیست نظرات", path: ROUTES.Comment, pro: false }],
  },
  {
    icon: <CommentIcon />,
    name: "تماس با ما",
    subItems: [{ name: "لیست تماس با ما", path: ROUTES.ContactUs, pro: false }],
  },
  {
    icon: <UserCircleIcon />,
    name: "کاربران",
    subItems: [
      { name: "لیست کاربران", path: "/dashboard/users", pro: false },
      { name: "لیست کاربران ادمین", path: "/dashboard/admin" },
    ],
  },
  {
    icon: <SettingTabIcon />,
    name: "تنظیمات",
    subItems: [
      {
        name: "لیست نحوه ارسال",
        path: "/dashboard/setting/shipping",
        pro: false,
      },
      { name: "بنرها", path: ROUTES.Banners, pro: false },
      {
        name: "لیست دسترسی‌ها",
        path: "/dashboard/setting/permissions",
        pro: false,
      },
      { name: "لیست نقش‌ها", path: "/dashboard/setting/roles", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "پروفایل",
    path: "/dashboard/profile",
  },
];
