"use client";
import FloatingField from "@/app/components/FloatingField";
import { useState } from "react";
import React from "react";
import {
  Folder,
  FileText,
  ExternalLink,
  Download,
  Plus,
  X,
  Trash2,
} from "lucide-react";

export default function DocumentsClient({
  documents,
  canManage,
  createDocumentAction,
  deleteDocumentAction,
}: any) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (formData: FormData) => {
    setFormError(null);
    try {
      await createDocumentAction(formData);
      setIsAddModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setFormError(
        err?.message || "Dokument se nepodařilo uložit. Zkontrolujte URL adresu.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Opravdu chceš tento dokument smazat?")) {
      try {
        await deleteDocumentAction(id);
        window.location.reload();
      } catch (err: any) {
        alert(err?.message || "Nepodařilo se smazat dokument.");
      }
    }
  };

  React.useEffect(() => {
    if (isAddModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isAddModalOpen]);

  const categoriesMap: { [key: string]: any[] } = {};
  documents.forEach((doc: any) => {
    if (!categoriesMap[doc.category]) categoriesMap[doc.category] = [];
    categoriesMap[doc.category].push(doc);
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Folder className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a237e]">
              Dokumenty
            </h1>
            <p className="text-gray-500 mt-1">
              Důležité soubory, formuláře a odkazy.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" /> Přidat dokument
          </button>
        )}
      </div>

      <div className="space-y-8">
        {Object.keys(categoriesMap).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">
              Zatím nejsou přidány žádné dokumenty.
            </p>
          </div>
        ) : (
          Object.keys(categoriesMap).map((categoryName, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoriesMap[categoryName].map((doc: any) => (
                  <div
                    key={doc.id}
                    data-testid="document-card"
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#00c853] hover:shadow-sm transition-all group relative"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 flex-1"
                    >
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-green-50 transition-colors">
                        <FileText className="w-6 h-6 text-gray-400 group-hover:text-[#00c853]" />
                      </div>
                      <div className="flex-1 font-medium text-gray-700 group-hover:text-gray-900 truncate">
                        {doc.name}
                      </div>
                      {doc.type === "link" ? (
                        <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[#00c853]" />
                      ) : (
                        <Download className="w-5 h-5 text-gray-300 group-hover:text-[#00c853]" />
                      )}
                    </a>

                    {canManage && (
                      <button
                        type="button"
                        aria-label={`Smazat dokument ${doc.name}`}
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL PRO PŘIDÁNÍ DOKUMENTU */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Přidat dokument"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-[#1a237e]">
                Přidat dokument
              </h2>
              <button
                type="button"
                aria-label="Zavřít modal"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleCreate} className="p-6 space-y-4 pb-12">
              {formError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200"
                >
                  {formError}
                </div>
              )}
              <FloatingField
                id="doc-name"
                type="text"
                name="name"
                label="Název souboru/odkazu"
                required
                placeholder="Např. Přihláška na tábor"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#00c853] focus:border-transparent outline-none transition-all"
              />
              <FloatingField
                id="doc-url"
                type="url"
                name="url"
                label="URL adresa (Odkaz ke stažení/zobrazení)"
                required
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#00c853] focus:border-transparent outline-none transition-all"
              />
              <div>
                <FloatingField
                  id="doc-category"
                  type="text"
                  name="category"
                  label="Kategorie"
                  list="cat-list"
                  required
                  placeholder="Např. Formuláře"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#00c853] focus:border-transparent outline-none transition-all"
                />
                <datalist id="cat-list">
                  <option value="Přihlášky a formuláře" />
                  <option value="Tábor" />
                  <option value="Pro vedoucí" />
                </datalist>
              </div>
              <FloatingField
                id="doc-targetRole"
                as="select"
                name="targetRole"
                label="Viditelnost (Pro koho je soubor určen?)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-[#00c853] focus:border-transparent outline-none transition-all"
              >
                <option value="all">Všichni (Děti, Rodiče, Vedoucí)</option>
                <option value="parent">Rodiče a Vedoucí</option>
                <option value="user">Pouze Vedoucí (a Admini)</option>
              </FloatingField>
              <button
                type="submit"
                className="w-full bg-[#00c853] hover:bg-[#00b34a] text-white font-bold py-3.5 rounded-xl mt-4 transition-colors"
              >
                Uložit dokument
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
