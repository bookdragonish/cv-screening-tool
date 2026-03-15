import { FileText, User, Home, Clock } from "lucide-react";
import NavItem from "./NavItem";

const navItems = [
  { to: "/", label: "Oversikt", icon: Home },
  { to: "/kandidater", label: "Kandidater", icon: FileText },
  { to: "/screening-historikk", label: "Skanninghistorikk", icon: Clock },
];

function Navbar() {
  return (
    <header className="border-b border-(--color-primary) bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <Logo />

          <nav aria-label="Hovednavigasjon" className="flex flex-wrap items-center gap-4 sm:gap-6">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavItem key={to} to={to} label={label} icon={Icon} />
            ))}
          </nav>
        </div>

        <Profile />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-(--color-primary) p-2">
        <FileText className="h-5 w-5 text-white" />
      </div>
      <h1 className="text-xl font-semibold text-(--color-dark)">Job-Scan</h1>
    </div>
  );
}

function Profile() {
  return (
    <div className="flex items-center gap-2 text-(--color-dark) sm:self-auto">
      <User className="h-5 w-5" />
      <span className="text-sm font-medium">HR-bruker</span>
    </div>
  );
}

export default Navbar;
