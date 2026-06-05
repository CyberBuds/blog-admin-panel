import { LayoutDashboard, Bell } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  return (
    <nav className="w-full h-14 px-4 md:px-6 flex items-center justify-between bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
          <LayoutDashboard size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">
          Blog<span className="text-indigo-500">Admin</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center
            text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-150">
          <Bell size={16} strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
              bg-red-500 ring-2 ring-white dark:ring-gray-950" />
        </button>
        <ProfileDropdown />
      </div>
    </nav>
  );
}