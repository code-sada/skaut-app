'use client'

import { Trash2 } from 'lucide-react'
import { deleteEvent } from './actions'

interface DeleteButtonProps {
  eventId: string
  userRole: string
}

export default function DeleteButton({ eventId, userRole }: DeleteButtonProps) {
  return (
    <form action={deleteEvent}>
      <input type="hidden" name="id" value={eventId} />
      <input type="hidden" name="userRole" value={userRole} />
      <button 
        type="submit" 
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        onClick={(e) => {
          if (!confirm("Opravdu chcete tuto akci smazat?")) {
            e.preventDefault() // Zruší smazání, pokud klikneš na Storno
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}