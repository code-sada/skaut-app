"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  CheckCircle2,
  User,
  Calendar,
  Compass,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import {
  markNotificationAsRead,
  globalSearch,
  type SearchResultGroup,
} from "@/app/actions";

export default function Header({
  notifications = [],
  currentUser,
}: {
  notifications?: any[];
  currentUser?: any;
}) {
  const router = useRouter();
  const [isBellOpen, setIsBellOpen] = useState(false);

  // Vyhledávací stav
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  // Klávesová zkratka Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Zavření při kliknutí mimo vyhledávač
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce vyhledávání
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error("Chyba vyhledávání:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleSelectResult = (href: string) => {
    setIsSearchOpen(false);
    setQuery("");
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      router.push(href);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-5 h-5 text-blue-600" />;
      case "event":
        return <Calendar className="w-5 h-5 text-green-600" />;
      case "meeting":
        return <Compass className="w-5 h-5 text-amber-600" />;
      case "document":
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    // ZMĚNĚNO: z-[100] nahrazeno za z-30, aby hlavička neprorážela modální okna
    <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-30 w-full">
      {/* VYHLEDÁVACÍ POLE */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Hledat (Ctrl + K)"
            className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-base focus:ring-2 focus:ring-[#00c853]/50 focus:bg-white outline-none text-gray-800 font-medium placeholder-gray-400 transition-all shadow-sm"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-3 text-[10px] font-bold text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded border border-gray-300">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* NAŠEPTÁVAČ A VÝSLEDKY */}
        {isSearchOpen && query.trim().length >= 2 && (
          // ZMĚNĚNO: z-[150] nahrazeno za z-50
          <div className="fixed md:absolute top-16 md:top-14 left-0 right-0 md:left-0 md:right-auto md:w-[450px] bg-white border-b md:border border-gray-200 shadow-2xl md:rounded-2xl z-50 h-[calc(100dvh-4rem)] md:h-auto md:max-h-[60vh] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center gap-3 text-gray-500 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-[#00c853]" />
                Vyhledávám v databázi...
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-base font-medium">
                Nebyly nalezeny žádné výsledky pro &quot;
                <span className="text-gray-900">{query}</span>&quot;.
              </div>
            ) : (
              <div className="py-2 pb-24 md:pb-2">
                {results.map((group, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80 sticky top-0 z-10">
                      {group.category}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item.href)}
                        className="w-full text-left px-5 py-3 hover:bg-blue-50/50 transition-colors flex items-center gap-4 group border-b border-gray-50 last:border-none"
                      >
                        <div className="p-2.5 rounded-xl bg-gray-100 group-hover:bg-white transition-colors shrink-0">
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base md:text-sm font-bold text-gray-900 truncate group-hover:text-[#1a237e] transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-sm md:text-xs text-gray-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPOZORNĚNÍ / ZVONEČEK */}
      <div className="flex items-center gap-2 relative z-50">
        <button
          onClick={() => setIsBellOpen(!isBellOpen)}
          className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative focus:outline-none"
        >
          <Bell className="w-6 h-6 md:w-5 md:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        {isBellOpen && (
          // ZMĚNĚNO: z-[150] nahrazeno za z-50
          <div className="absolute top-14 right-0 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-sm">
                Upozornění
              </h3>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} nových
              </span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {safeNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm font-medium">
                  Nic nového. Jsi v klidu! 🏕️
                </div>
              ) : (
                safeNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 flex gap-3 ${
                      notif.isRead ? "opacity-50" : "bg-blue-50/20"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => handleRead(notif.id)}
                        className="text-blue-600 hover:text-blue-800 self-center p-1"
                        title="Označit jako přečtené"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
