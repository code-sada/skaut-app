"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Edit,
  HeartPulse,
  Phone,
  Plus,
  X,
  FileText,
} from "lucide-react";
import { requestProfileUpdate, createMember } from "./actions";

function calculateAge(birthDate: Date | string | null) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

export default function MembersClient({
  users,
  patrols,
  currentUserId,
  currentUserRole,
}: any) {
  const [search, setSearch] = useState("");
  const [patrolFilter, setPatrolFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");

  const [editingUser, setEditingUser] = useState<any>(null);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FIX: Zablokování posuvníku a schování bílého pruhu
  useEffect(() => {
    if (editingUser || detailUser || isAddModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [editingUser, detailUser, isAddModalOpen]);

  const inputClass =
    "w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#1a237e]";

  const filteredUsers = users.filter((u: any) => {
    const matchName = u.name.toLowerCase().includes(search.toLowerCase());
    const matchPatrol = patrolFilter === "" || u.patrolId === patrolFilter;
    const age = calculateAge(u.birthDate);
    let matchAge = true;
    if (ageFilter === "under10") matchAge = age !== null && age < 10;
    if (ageFilter === "11to15")
      matchAge = age !== null && age >= 11 && age <= 15;
    if (ageFilter === "over15") matchAge = age !== null && age > 15;

    return matchName && matchPatrol && matchAge && u.role === "MEMBER";
  });

  const handleCreateMember = async (formData: FormData) => {
    setFormError(null);
    const result = await createMember(formData);
    if (!result?.success) {
      setFormError(result?.error || "Něco se pokazilo.");
    } else {
      setIsAddModalOpen(false);
    }
  };

  const handleEditMember = async (formData: FormData) => {
    const result = await requestProfileUpdate(formData);
    if (result?.success) setEditingUser(null);
  };

  const isLeader = currentUserRole === "admin" || currentUserRole === "LEADER";

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 flex flex-col md:flex-row gap-4 shadow-sm items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat dítě podle jména..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-[#1a237e] text-gray-900"
          />
        </div>

        <select
          aria-label="Filtro podle družiny"
          value={patrolFilter}
          onChange={(e) => setPatrolFilter(e.target.value)}
          className="w-full md:w-auto p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-[#1a237e] text-gray-700 font-medium"
        >
          <option value="">Všechny družiny</option>
          {patrols.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtro podle věku"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="w-full md:w-auto p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-[#1a237e] text-gray-700 font-medium"
        >
          <option value="">Jakýkoliv věk</option>
          <option value="under10">Do 10 let</option>
          <option value="11to15">11 - 15 let</option>
          <option value="over15">Nad 15 let</option>
        </select>

        {isLeader && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto bg-[#00c853] hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Přidat člena
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user: any) => (
          <div
            key={user.id}
            onClick={() => setDetailUser(user)}
            className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col gap-3 relative cursor-pointer hover:border-[#1a237e] transition-colors"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingUser(user);
              }}
              className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-extrabold text-xl text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-1">
                {user.patrol?.name || "Bez družiny"} • Věk:{" "}
                {calculateAge(user.birthDate) ?? "?"} let
              </p>
            </div>

            <div className="mt-2 space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span
                  className={
                    user.healthNote || user.dietaryRestrictions
                      ? "font-bold text-gray-900 line-clamp-1"
                      : "text-gray-400 italic"
                  }
                >
                  {user.healthNote || user.dietaryRestrictions || "Bez záznamů"}
                </span>
              </p>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10 font-medium bg-white rounded-2xl border-2 border-dashed border-gray-200">
            Nikoho jsme s tímto filtrem nenašli.
          </p>
        )}
      </div>

      {detailUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setDetailUser(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-extrabold text-[#1a237e]">
                  {detailUser.name}
                </h2>
                <p className="text-gray-500 font-bold mt-1">
                  {detailUser.patrol?.name || "Bez družiny"} • Věk:{" "}
                  {calculateAge(detailUser.birthDate) ?? "?"} let
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingUser(detailUser);
                    setDetailUser(null);
                  }}
                  className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Upravit
                </button>
                <button
                  onClick={() => setDetailUser(null)}
                  className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b-2 border-gray-200 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <h3 className="font-extrabold text-lg text-gray-900">
                    Čísla na rodiče / zástupce
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {detailUser.parentPhone && (
                    <div className="col-span-full bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <span className="text-gray-500 font-bold block mb-1">
                        Hlavní sdílené číslo:
                      </span>
                      <span className="font-extrabold text-lg text-gray-900">
                        {detailUser.parentPhone}
                      </span>
                    </div>
                  )}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold block mb-1">
                      Matka:
                    </span>
                    <span className="font-bold text-gray-900 block">
                      {detailUser.motherName || "Nevyplněno"}
                    </span>
                    <span className="font-medium text-gray-700">
                      {detailUser.motherPhone || "-"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold block mb-1">
                      Otec:
                    </span>
                    <span className="font-bold text-gray-900 block">
                      {detailUser.fatherName || "Nevyplněno"}
                    </span>
                    <span className="font-medium text-gray-700">
                      {detailUser.fatherPhone || "-"}
                    </span>
                  </div>
                  <div className="col-span-full p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold block mb-1">
                      Jiní zástupci:
                    </span>
                    <span className="font-bold text-gray-900 block">
                      {detailUser.otherGuardianName || "Nevyplněno"}
                    </span>
                    <span className="font-medium text-gray-700">
                      {detailUser.otherGuardianPhone || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-2xl border-2 border-red-200 overflow-hidden">
                  <div className="bg-red-100 p-4 border-b-2 border-red-200 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-600" />
                    <h3 className="font-extrabold text-lg text-red-900">
                      Zdraví a strava
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <span className="text-red-900 font-bold block mb-1">
                        Zdravotní upozornění:
                      </span>
                      <p className="text-red-800 whitespace-pre-wrap">
                        {detailUser.healthNote || "Žádné záznamy."}
                      </p>
                    </div>
                    <div>
                      <span className="text-red-900 font-bold block mb-1">
                        Dietní omezení / Alergie na jídlo:
                      </span>
                      <p className="text-red-800 whitespace-pre-wrap">
                        {detailUser.dietaryRestrictions || "Žádné záznamy."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b-2 border-gray-200 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-extrabold text-lg text-gray-900">
                      Informace
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <p className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-bold">Věk:</span>{" "}
                      <span className="font-extrabold text-gray-900">
                        {calculateAge(detailUser.birthDate) ?? "?"}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-bold">
                        Datum narození:
                      </span>{" "}
                      <span className="font-extrabold text-gray-900">
                        {detailUser.birthDate
                          ? new Date(detailUser.birthDate).toLocaleDateString(
                              "cs-CZ",
                            )
                          : "?"}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-bold">Družina:</span>{" "}
                      <span className="font-extrabold text-gray-900">
                        {detailUser.patrol?.name || "-"}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-bold">Bydliště:</span>{" "}
                      <span className="font-extrabold text-gray-900 text-right">
                        {detailUser.address
                          ? `${detailUser.address}, ${detailUser.city} ${detailUser.postalCode}`
                          : "-"}
                      </span>
                    </p>

                    <div>
                      <span className="text-gray-500 font-bold block mb-1">
                        Sourozenci v oddíle:
                      </span>
                      <div className="font-extrabold text-gray-900">
                        {!detailUser.siblings?.length &&
                        !detailUser.siblingOf?.length ? (
                          "Žádní evidovaní"
                        ) : (
                          <ul className="list-disc list-inside">
                            {[
                              ...(detailUser.siblings || []),
                              ...(detailUser.siblingOf || []),
                            ].map((sib: any) => (
                              <li key={sib.id}>{sib.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-extrabold text-gray-900">
                Přidat nového člena
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleCreateMember} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl border-2 border-red-200">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Např. Jan Novák"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Email (přihlašovací jméno)
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jan.novak@skaut.cz"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Družina
                  </label>
                  <select name="patrolId" className={inputClass}>
                    <option value="">Bez družiny</option>
                    {patrols.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Datum narození
                  </label>
                  <input type="date" name="birthDate" className={inputClass} />
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4">
                <h3 className="font-extrabold text-gray-900 mb-4">Bydliště</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Ulice a č.p.
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Skautská 123"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Město
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Brno"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      PSČ
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="602 00"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4">
                <h3 className="font-extrabold text-gray-900 mb-4">
                  Kontakty na rodinu
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Hlavní telefonní číslo (obecné)
                    </label>
                    <input
                      type="text"
                      name="parentPhone"
                      placeholder="+420..."
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="motherName"
                      placeholder="Jméno matky"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="motherPhone"
                      placeholder="Telefon matka"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="Jméno otce"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="fatherPhone"
                      placeholder="Telefon otec"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="otherGuardianName"
                      placeholder="Jiný zástupce (jméno)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="otherGuardianPhone"
                      placeholder="Jiný zástupce (telefon)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Zdravotní upozornění
                  </label>
                  <textarea
                    name="healthNote"
                    placeholder="Alergie, léky..."
                    className={`${inputClass} h-20`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Dietní omezení / Alergie jídlo
                  </label>
                  <textarea
                    name="dietaryRestrictions"
                    placeholder="Bezlepková dieta, ořechy..."
                    className={`${inputClass} h-20`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a237e] hover:bg-blue-900 text-white p-4 rounded-xl font-bold transition-colors text-lg"
              >
                Uložit člena
              </button>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-extrabold text-gray-900">
                Úprava údajů: {editingUser.name}
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleEditMember} className="p-6 space-y-6">
              <input type="hidden" name="userId" value={editingUser.id} />
              <input
                type="hidden"
                name="requestedBy"
                value={currentUserId || "unknown"}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Družina
                  </label>
                  <select
                    name="patrolId"
                    defaultValue={editingUser.patrolId || ""}
                    className={inputClass}
                  >
                    <option value="">Bez družiny</option>
                    {patrols.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Datum narození
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    defaultValue={
                      editingUser.birthDate
                        ? new Date(editingUser.birthDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4">
                <h3 className="font-extrabold text-gray-900 mb-4">Bydliště</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Ulice a č.p.
                    </label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={editingUser.address || ""}
                      placeholder="Skautská 123"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Město
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingUser.city || ""}
                      placeholder="Brno"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      PSČ
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={editingUser.postalCode || ""}
                      placeholder="602 00"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4">
                <h3 className="font-extrabold text-gray-900 mb-4">
                  Kontakty na rodinu
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Hlavní telefonní číslo
                    </label>
                    <input
                      type="text"
                      name="parentPhone"
                      defaultValue={editingUser.parentPhone || ""}
                      placeholder="+420..."
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="motherName"
                      defaultValue={editingUser.motherName || ""}
                      placeholder="Jméno matky"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="motherPhone"
                      defaultValue={editingUser.motherPhone || ""}
                      placeholder="Telefon matka"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="fatherName"
                      defaultValue={editingUser.fatherName || ""}
                      placeholder="Jméno otce"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="fatherPhone"
                      defaultValue={editingUser.fatherPhone || ""}
                      placeholder="Telefon otec"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="otherGuardianName"
                      defaultValue={editingUser.otherGuardianName || ""}
                      placeholder="Jiný zástupce (jméno)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="otherGuardianPhone"
                      defaultValue={editingUser.otherGuardianPhone || ""}
                      placeholder="Jiný zástupce (telefon)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Zdravotní upozornění
                  </label>
                  <textarea
                    name="healthNote"
                    defaultValue={editingUser.healthNote || ""}
                    placeholder="Astma, léky..."
                    className={`${inputClass} h-20`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Dietní omezení / Alergie jídlo
                  </label>
                  <textarea
                    name="dietaryRestrictions"
                    defaultValue={editingUser.dietaryRestrictions || ""}
                    placeholder="Bezlepková dieta, ořechy..."
                    className={`${inputClass} h-20`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a237e] hover:bg-blue-900 text-white p-4 rounded-xl font-bold transition-colors text-lg"
              >
                Odeslat úpravy ke schválení
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
