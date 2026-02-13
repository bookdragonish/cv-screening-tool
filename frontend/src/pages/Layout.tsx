import { Link, Outlet, useLocation } from "react-router"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { FileText, User, Home, Clock } from "lucide-react"

export default function Layout() {
  const location = useLocation();
  
  const navLinks = [
    { path: "/", label: "Oversikt", icon: Home },
    { path: "/cv-database", label: "CV-database", icon: FileText },
    { path: "/screening-history", label: "Screeninghistorikk", icon: Clock },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="bg-blue-600 rounded-lg p-2">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">CV-screening</h1>
              </div>
              <nav className="flex items-center gap-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">HR-bruker</span>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </ThemeProvider>
  )
}
