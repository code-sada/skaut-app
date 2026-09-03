import React, { useState, useEffect, ReactNode } from "react";

// Definice typů pro komponentu
interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Explicitně typovaný stav pro mobilní menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasModal = document.querySelector(
        '[role="dialog"], .modal-overlay',
      );
      if (hasModal) {
        document.body.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800">
      {/* MOBILNÍ NAVIGACE */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-black focus:outline-none"
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

        <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm focus:outline-none">
          <img
            src="/avatar.jpg"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* BOČNÍ MENU */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl md:shadow-none
        transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4 flex-1">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-black"
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

          <nav className="mt-10 md:mt-4 space-y-2">
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Nástěnka
            </a>
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Události
            </a>
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Dokumenty
            </a>
          </nav>
        </div>

        {/* PROFILOVKA NA PC */}
        <div className="hidden md:flex items-center gap-3 p-4 border-t hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full overflow-hidden border shadow-sm">
            <img
              src="/avatar.jpg"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">Jan Novák</p>
            <p className="text-xs text-gray-500">Odhlásit se</p>
          </div>
        </div>
      </aside>

      {/* BACKDROP NA MOBILU */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* HLAVNÍ OBSAH */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
