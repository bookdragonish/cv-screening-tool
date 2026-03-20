import { NavLink } from "react-router";

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};


function NavItem({ to, label, icon: Icon }: NavItemProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2",
            isActive
              ? "text-(--color-primary) opacity-100"
              : "text-(--color-dark) opacity-80 hover:opacity-100",
          ].join(" ")
        }
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    </li>
  );
} export default NavItem;