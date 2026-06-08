import React, { useEffect } from "react";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../zustand/useAuthStore";
import { useRef } from "react";
import { Link } from "react-router-dom";
const SettingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const handleClick = (e) => {
    setIsOpen(!isOpen);
  };

  const { logout } = useAuthStore();
  const handleLockout = (e) => {
    logout();
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span>⚙️</span>
            Setting
          </Link>

          <div className="h-px bg-gray-100" />

          <button
            type="button"
            onClick={handleLockout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingButton;
