import type { ComponentType } from "react";

const NavButton = ({
  icon: Icon,
  label,
  ClassName,
  onClick,
  iconSize,
  active = false,
}: {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label?: string;
  ClassName?: string;
  onClick?: () => void;
  iconSize?: number;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex min-w-0 flex-1 flex-col items-center rounded-md px-0.5 py-1 transition-colors focus:outline-none ${
      active ? "text-red-500" : "text-gray-600 hover:text-red-500"
    } ${ClassName ?? ""}`}
    aria-label={label}
    type="button"
  >
    <Icon size={iconSize ? iconSize : 22} aria-hidden />
    <span className="mt-1 max-w-full truncate text-center text-[10px] leading-tight sm:text-[11px]">
      {label}
    </span>
  </button>
);

export default NavButton;
