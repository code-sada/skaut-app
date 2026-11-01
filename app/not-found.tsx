import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1a237e] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1a237e]">
            Zabloudili jsme v lese (404)
          </h1>
          <p className="text-sm text-gray-500">
            Tato stránka neexistuje nebo byla přesunuta.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#00c853] hover:bg-[#00b34a] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
        >
          <Home className="w-4 h-4" /> Zpět na přehled
        </Link>
      </div>
    </div>
  );
}
