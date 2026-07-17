'use client'
import { useState } from 'react'
import { Trash2, ShieldAlert, Plus, Pencil, Key, Mail, X, Users } from 'lucide-react'

// Překladový slovník pro role
const roleTranslations: { [key: string]: string } = {
  child: 'Dítě',
  parent: 'Rodič',
  user: 'Vedoucí',
  admin: 'Administrátor'
}

// Slovník pro barvy štítků
const roleColors: { [key: string]: string } = {
  admin: 'bg-amber-100 text-amber-700',
  user: 'bg-blue-100 text-blue-700', // Krásná modrá pro vedoucí
  parent: 'bg-gray-100 text-gray-700', // Šedá pro rodiče
  child: 'bg-gray-100 text-gray-700' // Šedá pro děti
}

export default function AdminContent({ users, patrols, currentUser, createUser, editUser, forcePasswordReset, deleteUser }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Správa účtů</h1>
          <p className="text-gray-500 mt-1">Vytváření, úprava a zabezpečení přístupů.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Vytvořit účet
        </button>
      </div>

      <div className="space-y-4">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a237e] font-bold flex items-center justify-center shrink-0">
                {user.name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email || 'Bez e-mailu'}</p>
                  {user.patrol && (
                    <p className="text-sm text-blue-600 flex items-center gap-1"><Users className="w-3 h-3" /> {user.patrol.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Zde se aplikuje barva podle role a název podle překladu */}
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                {roleTranslations[user.role] || user.role}
              </span>
              {user.mustChangePassword && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700">Vyžadována změna hesla</span>
              )}
              <button onClick={() => { setEditingUser(user); setIsModalOpen(true) }} className="p-2 text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => forcePasswordReset(user.id)} className="p-2 text-gray-400 hover:text-orange-600" title="Vynutit změnu hesla"><Key className="w-4 h-4" /></button>
              {user.id !== currentUser.id ? (
                <form action={deleteUser}><input type="hidden" name="id" value={user.id} /><button type="submit" className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></form>
              ) : <ShieldAlert className="w-4 h-4 text-gray-200" />}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingUser ? 'Upravit účet' : 'Vytvořit účet'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <form action={editingUser ? editUser : createUser} onSubmit={() => setIsModalOpen(false)} className="space-y-4">
              {editingUser && <input type="hidden" name="id" value={editingUser.id} />}
              
              <input name="name" defaultValue={editingUser?.name} placeholder="Jméno a příjmení" className="w-full p-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-400 border-gray-200" required />
              <input name="email" type="email" defaultValue={editingUser?.email} placeholder="E-mail" className="w-full p-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-400 border-gray-200" required />
              
              <select name="role" defaultValue={editingUser?.role || 'child'} className="w-full p-2.5 border rounded-lg bg-white text-gray-900 border-gray-200">
                <option value="child">Dítě</option>
                <option value="parent">Rodič</option>
                <option value="user">Vedoucí</option>
                <option value="admin">Administrátor</option>
              </select>

              <select name="patrolId" defaultValue={editingUser?.patrolId || 'none'} className="w-full p-2.5 border rounded-lg bg-white text-gray-900 border-gray-200">
                <option value="none">-- Bez družiny --</option>
                {patrols?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {!editingUser && (
                <input 
                  name="password" 
                  type="text"
                  defaultValue="skaut123" 
                  placeholder="Heslo" 
                  className="w-full p-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-400 border-gray-200" 
                  required 
                />
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-bold transition-colors mt-2">
                Uložit účet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}