import { loginUser } from '../actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        
        <div className="text-center">
          <span className="text-3xl">⚜️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Přihlášení do IS</h1>
          <p className="text-sm text-gray-500 mt-1">Zadejte své skautské přihlašovací údaje.</p>
        </div>

        <form action={loginUser} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</label>
            <input 
              type="email"
              id="email"
              name="email" 
              placeholder="jmeno@skaut.cz"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Heslo</label>
            <input 
              type="password"
              id="password"
              name="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2.5 rounded-lg text-sm font-bold shadow-sm"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  )
}