import { NavLink } from "react-router";

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};


function NavItem({ to, label, icon: Icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 text-sm font-medium transition-opacity",
          isActive
            ? "text-(--color-primary) opacity-100"
            : "text-(--color-dark) opacity-60 hover:opacity-100",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
} export default NavItem;