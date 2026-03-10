import { Link, Outlet, useLocation } from "react-router"
import { FileText, User, Home, Clock } from "lucide-react"

export default function Layout() {
  const location = useLocation();
  
  const navLinks = [
    { path: "/", label: "Oversikt", icon: Home },
    { path: "/cv-database", label: "CV-database", icon: FileText },
    { path: "/screening-historikk", label: "Screeninghistorikk", icon: Clock },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="border-b border-(--color-primary) bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="rounded-lg bg-(--color-primary) p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-(--color-dark)">Job-Scan</h1>
            </div>
            <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-opacity ${
                      isActive
                        ? "text-(--color-primary) opacity-100"
                        : "text-(--color-dark) opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 text-(--color-dark) sm:self-auto">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">HR-bruker</span>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
