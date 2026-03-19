import { Outlet } from "react-router";
import Navbar from "@/components/Navbar/Navbar";

export default function Layout() {

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
