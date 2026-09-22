import IconProps from "libs/models/icon.types";
import IconWrapper from "../common/IconWrapper/IconWrapper";

const WarehouseIcon = ({
  className,
  stroke = "currentColor",
  fill = "none",
  strokeWidth = "1.5",
}: IconProps) => (
  <svg
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 21V8.5L12 3l9 5.5V21M7 21v-8h10v8M7 17h10"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconWrapper(WarehouseIcon);
