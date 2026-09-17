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
        '[role="dialog"], [data-headlessui-state="open"], .fixed.inset-0.bg-black, .modal-open, .fixed.inset-0',
      );
      if (hasModal) document.body.classList.add("overflow-hidden");
      else document.body.classList.remove("overflow-hidden");
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Tmavé pozadí na mobilu při rozbaleném menu */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Boční menu - z-index pouze na mobilu (aby přejelo obsah), na PC je z-auto, aby nepřekáželo modálům */}
      <div
        className={`
        fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 flex flex-col shadow-2xl md:shadow-none shrink-0
        z-[70] md:relative md:translate-x-0 md:z-auto
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex-1 overflow-y-auto w-full">{sidebar}</div>

        {/* Křížek na mobilu */}
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
        {/* MOBILNÍ HLAVIČKA - čistý flex bez omezujícího z-indexu */}
        <div className="md:hidden flex items-center bg-white border-b w-full shrink-0">
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
          {/* Obal pro Header */}
          <div className="flex-1 min-w-0">{header}</div>
        </div>

        {/* DESKTOP HLAVIČKA - čistý blok */}
        <div className="hidden md:block shrink-0">{header}</div>

        {/* HLAVNÍ OBSAH - odstraněno relative a z-10, tma teď může "ven" na zbytek stránky */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
