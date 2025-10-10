const NavButton = ({
  icon: Icon,
  label,
  ClassName,
  onClick,
  iconSize
}: {
  icon: any;
  label?: string;
  ClassName?: string,
  onClick?: () => void;
  iconSize?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center hover:text-red-500 focus:outline-none rounded-md ${ClassName}`}
    aria-label={label}
  >
    <Icon size={iconSize? iconSize : 22} aria-hidden />
    <span className="text-xs text-nowrap">{label}</span>
  </button>
);

export default  NavButton 