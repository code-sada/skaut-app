import { forceChangePassword } from '../actions'

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        
        <div className="text-center">
          <span className="text-3xl">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">První přihlášení</h1>
          <p className="text-sm text-gray-500 mt-1">Administrátor vám vytvořil dočasný účet. Z bezpečnostních důvodů si prosím zvolte své vlastní heslo.</p>
        </div>

        <form action={forceChangePassword} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Nové heslo</label>
            <input 
              type="password"
              id="newPassword"
              name="newPassword" 
              placeholder="Zadejte své nové tajné heslo"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
              minLength={4}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-2.5 rounded-lg text-sm font-bold shadow-sm"
          >
            Uložit nové heslo a vstoupit
          </button>
        </form>

      </div>
    </div>
  )
}