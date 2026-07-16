import Link from 'next/link'
import { Hammer } from 'lucide-react'

export default function WorkInProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
      <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
        <Hammer className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Pracujeme na tom! 🚧</h1>
      <p className="text-gray-500 mb-8 max-w-md text-lg">
        Tato sekce se momentálně připravuje. Brzy tady najdeš nové super funkce pro správu oddílu.
      </p>
      <Link href="/" className="px-6 py-3 bg-[#00c853] hover:bg-[#00b34a] text-white font-bold rounded-xl transition-colors shadow-sm">
        Zpět na přehled
      </Link>
    </div>
  )
}