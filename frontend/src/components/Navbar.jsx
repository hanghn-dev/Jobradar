import React from "react";

const Navbar = () => {
  return (
    <div className="navbar bg-slate-200 shadow-sm">
      <div className="flex-1"></div>
      <div className="flex-none">
        <a className="btn btn-ghost text-base sm:text-xl md:text-2xl font-bold text-cyan-600 px-3 sm:px-4">
          JOBRADAR
        </a>
      </div>
      <div className="flex-1"></div>
    </div>
  );
};

export default Navbar;
