import { FileText, User, Home, Clock } from "lucide-react";
import { Link } from "react-router";
import NavItem from "./NavItem";

const navItems = [
  { to: "/", label: "Hjem", icon: Home },
  { to: "/kandidater", label: "Kandidater", icon: FileText },
  { to: "/screening-historikk", label: "Skanninghistorikk", icon: Clock },
];

function Navbar() {
  return (
    <header className="border-b border-(--color-primary) bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <Logo />

          <nav aria-label="Hovednavigasjon">
            <ul className="flex flex-wrap items-center gap-4 sm:gap-6">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavItem key={to} to={to} label={label} icon={Icon} />
              ))}
            </ul>
          </nav>
        </div>

        <Profile />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
      aria-label="Gå til hovedside"
    >
      <div className="rounded-lg bg-(--color-primary) p-2">
        <FileText className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <h1 className="section-title font-semibold text-(--color-dark)">Job-Scan</h1>
    </Link>
  );
}

function Profile() {
  return (
    <section
      aria-label="Innlogget bruker"
      className="flex items-center gap-2 text-(--color-dark) sm:self-auto"
    >
      <User className="h-5 w-5" aria-hidden="true" />
      <span className="text-regular font-medium">HR-bruker</span>
    </section>
  );
}

export default Navbar;
