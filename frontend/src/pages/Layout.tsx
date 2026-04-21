import { Outlet } from "react-router";
import Navbar from "@/components/Navbar/Navbar";

export default function Layout() {

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-(--color-dark)"
      >
        Hopp til hovedinnhold
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
      <Outlet />
      </main>
    </div>
  );
}
