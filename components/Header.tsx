"use client";
import { Bell, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { markNotificationAsRead } from "@/app/actions";

export default function Header({ notifications }: { notifications: any[] }) {
  const [isBellOpen, setIsBellOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 relative">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hledáte něco?"
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-[#00c853] outline-none text-gray-700 font-medium placeholder-gray-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 relative">
        <button
          onClick={() => setIsBellOpen(!isBellOpen)}
          className="text-gray-400 hover:text-gray-600 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Vyskakovací okno s upozorněními */}
        {isBellOpen && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-sm">
                Upozornění
              </h3>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                {unreadCount} nových
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm font-medium">
                  Nic nového. Jsi v klidu! 🏕️
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 flex gap-3 ${notif.isRead ? "opacity-50" : "bg-blue-50/30"}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-gray-900">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => handleRead(notif.id)}
                        className="text-blue-600 hover:text-blue-800 self-center"
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
