import React from "react";

const Footer = () => {
  return (
    <footer className="footer footer-center bg-slate-200 text-gray-600 px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base">
      <aside>
        <p>© {new Date().getFullYear()} JOBRADAR. All rights reserved.</p>
      </aside>
    </footer>
  );
};

export default Footer;
