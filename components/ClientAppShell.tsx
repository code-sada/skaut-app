"use client";
import React, { useState, useEffect, ReactNode } from "react";

interface ClientAppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export default function ClientAppShell({
  sidebar,
  header,
  children,
}: ClientAppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasModal = document.querySelector(
        '[role="dialog"], [data-headlessui-state="open"], .fixed.inset-0.bg-black, .modal-open',
      );
      if (hasModal) document.body.classList.add("overflow-hidden");
      else document.body.classList.remove("overflow-hidden");
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Tmavé pozadí na mobilu při rozbaleném menu */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Boční menu */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex-1 overflow-y-auto w-full">{sidebar}</div>

        {/* Křížek se vyrenderuje JEN tehdy, když je menu reálně otevřené */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute top-4 -right-12 p-2 bg-white rounded-full shadow-md text-gray-600 border border-gray-100 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col h-screen min-w-0">
        {/* MOBILNÍ HLAVIČKA */}
        <div className="md:hidden flex items-center bg-white border-b z-30 w-full relative">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-4 text-gray-600 focus:outline-none shrink-0"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Obal pro tvůj stávající Header (vyhledávání + zvonek) */}
          <div className="flex-1 min-w-0 overflow-hidden">{header}</div>
        </div>

        {/* DESKTOP HLAVIČKA */}
        <div className="hidden md:block shrink-0">{header}</div>

        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
