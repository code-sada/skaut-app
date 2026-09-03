"use client";
import { useState, useEffect } from "react";
import React from "react";
import {
  Trash2,
  ShieldAlert,
  Plus,
  Pencil,
  Key,
  Mail,
  X,
  Users,
} from "lucide-react";

// Překladový slovník pro všechny možné role v DB
const roleTranslations: { [key: string]: string } = {
  child: "Dítě",
  parent: "Rodič",
  user: "Vedoucí",
  leader: "Vedoucí",
  admin: "Administrátor",
  MEMBER: "Člen",
  member: "Člen",
};

// Slovník pro barvy štítků
const roleColors: { [key: string]: string } = {
  admin: "bg-amber-100 text-amber-700",
  user: "bg-blue-100 text-blue-700",
  leader: "bg-blue-100 text-blue-700",
  parent: "bg-gray-100 text-gray-700",
  child: "bg-gray-100 text-gray-700",
  MEMBER: "bg-gray-100 text-gray-700",
  member: "bg-gray-100 text-gray-700",
};

export default function AdminContent({
  users,
  patrols,
  currentUser,
  createUser,
  editUser,
  forcePasswordReset,
  deleteUser,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  if (!isMounted) return null;

  return (
    <div
      className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6"
      suppressHydrationWarning
    >
      {/* HLAVIČKA STRÁNKY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a237e]">
            Správa účtů
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5">
            Vytváření, úprava a zabezpečení přístupů.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> Vytvořit účet
        </button>
      </div>

      {/* SEZNAM UŽIVATELŮ */}
      <div className="space-y-3 sm:space-y-4">
        {users.map((user: any) => (
          <div
            key={user.id}
            data-testid="user-card"
            className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden"
          >
            {/* Uživatel: Avatar + Jméno + Email + Družina */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a237e] font-bold flex items-center justify-center shrink-0 text-sm">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "??"}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-snug">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {user.email || "Bez e-mailu"}
                    </span>
                  </div>
                  {user.patrol && (
                    <div className="text-blue-600 flex items-center gap-1 shrink-0 font-medium">
                      <Users className="w-3.5 h-3.5 shrink-0" />{" "}
                      {user.patrol.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Štítky rolí + Akční tlačítka */}
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                    roleColors[user.role] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {roleTranslations[user.role] || user.role}
                </span>
                {user.mustChangePassword && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 whitespace-nowrap">
                    Vyžadována změna
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Upravit profil"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => forcePasswordReset(user.id)}
                  className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Vynutit změnu hesla"
                  aria-label={`Vynutit změnu hesla ${user.name}`}
                >
                  <Key className="w-4 h-4" />
                </button>
                {user.id !== currentUser.id ? (
                  <form action={deleteUser} className="inline-block">
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      aria-label={`Smazat účet ${user.name}`}
                      title="Smazat účet"
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="p-2">
                    <ShieldAlert className="w-4 h-4 text-gray-200" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODÁLNÍ OKNO PRO VYTVOŘENÍ / ÚPRAVU UŽIVATELE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold">
                {editingUser ? "Upravit účet" : "Vytvořit účet"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              action={editingUser ? editUser : createUser}
              onSubmit={() => setIsModalOpen(false)}
              className="space-y-4 pb-2"
            >
              {editingUser && (
                <input type="hidden" name="id" value={editingUser.id} />
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Jméno a příjmení
                </label>
                <input
                  name="name"
                  defaultValue={editingUser?.name}
                  placeholder="Jan Novák"
                  className="w-full p-2.5 border rounded-xl bg-white text-gray-900 placeholder-gray-400 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  E-mail
                </label>
                <input
                  name="email"
                  type="text"
                  defaultValue={editingUser?.email}
                  placeholder="email@skaut.cz"
                  className="w-full p-2.5 border rounded-xl bg-white text-gray-900 placeholder-gray-400 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || "child"}
                  className="w-full p-2.5 border rounded-xl bg-white text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="child">Dítě</option>
                  <option value="parent">Rodič</option>
                  <option value="user">Vedoucí</option>
                  <option value="admin">Administrátor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Družina
                </label>
                <select
                  name="patrolId"
                  defaultValue={editingUser?.patrolId || "none"}
                  className="w-full p-2.5 border rounded-xl bg-white text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">-- Bez družiny --</option>
                  {patrols?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Heslo
                  </label>
                  <input
                    name="password"
                    type="text"
                    defaultValue="skaut123"
                    placeholder="Heslo"
                    className="w-full p-2.5 border rounded-xl bg-white text-gray-900 placeholder-gray-400 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-colors mt-4 shadow-sm"
              >
                Uložit účet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
