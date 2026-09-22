import IconProps from "libs/models/icon.types";
import IconWrapper from "../common/IconWrapper/IconWrapper";

const WalletIcon = ({
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
      d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 6a2 2 0 0 0 2 2h14a1 1 0 0 1 1 1v3m0 0h-4a2 2 0 1 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconWrapper(WalletIcon);
