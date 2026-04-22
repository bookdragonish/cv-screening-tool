import { FileText, User, Home, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router";
import NavItem from "./NavItem";
import { Button } from "@/components/ui/button";
import { AUTH_KEY } from "@/pages/LoginPage";

const navItems = [
  { to: "/", label: "Hjem", icon: Home },
  { to: "/kandidater", label: "Kandidater", icon: FileText },
  { to: "/skanning-historikk", label: "Skanninghistorikk", icon: Clock },
];

function Navbar() {
  return (
    <header className="border-b border-(--color-primary) bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
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
      <img src="/favicon.svg" alt="" className="h-8 w-auto" aria-hidden="true" />
      <h1 className="section-title font-semibold text-(--color-dark)">Jobb-skanner</h1>
    </Link>
  );
}

function Profile() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    navigate("/login");
  }

  return (
    <section
      aria-label="Innlogget bruker"
      className="flex items-center gap-3 sm:self-auto"
    >
      <User className="h-5 w-5 text-(--color-dark)" aria-hidden="true" />
      <span className="text-regular font-medium text-(--color-dark)">HR-bruker</span>
      <Button
        onClick={handleLogout}
        variant="destructive"
        size="sm"
        className="cursor-pointer"
      >
        Logg ut
      </Button>
    </section>
  );
}

export default Navbar;
