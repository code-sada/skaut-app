"use client"
import { useState } from 'react'
import { MessageCircle, Users, CheckCircle2, XCircle, X, Compass, Clock, Send } from 'lucide-react'

export default function MeetingCard({ meeting, currentUser, canManage, saveAttendance, sendMessage }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  // Zjistíme, jestli už není do schůzky méně než 2 hodiny
  const meetingDate = new Date(meeting.date)
  const now = new Date()
  const diffHours = (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isLocked = diffHours < 2 // Pokud zbývají méně než 2 hodiny, zamčeno!

  // Tvoje aktuální docházka
  const myAttendance = meeting.attendance?.find((a: any) => a.userId === currentUser?.id)

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all">
        <div className="flex gap-4 items-center">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{meeting.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" /> 
              {meetingDate.toLocaleDateString('cs-CZ')} ({meetingDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} - {meeting.endTime})
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">
          {meeting.patrol.name}
        </span>
      </div>

      {/* MODAL SCHŮZKY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-[#1a237e]">{meeting.title}</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex border-b border-gray-100 px-6">
              <button onClick={() => setActiveTab('info')} className={`py-3 px-4 text-sm font-bold border-b-2 flex gap-2 ${activeTab === 'info' ? 'border-[#1a237e] text-[#1a237e]' : 'border-transparent text-gray-400'}`}><Users className="w-4 h-4"/> Účast</button>
              <button onClick={() => setActiveTab('chat')} className={`py-3 px-4 text-sm font-bold border-b-2 flex gap-2 ${activeTab === 'chat' ? 'border-[#1a237e] text-[#1a237e]' : 'border-transparent text-gray-400'}`}><MessageCircle className="w-4 h-4"/> Chat ({meeting.messages?.length || 0})</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Přihlašování */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-[#1a237e] mb-3">Tvoje účast</h3>
                    
                    {isLocked ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
                        Změna účasti je uzamčena (méně než 2 hodiny do začátku). Tvoje finální rozhodnutí: {myAttendance?.status === 'GOING' ? 'Jedeš' : 'Nejedeš'}.
                      </div>
                    ) : (
                      <form action={saveAttendance} className="space-y-4">
                        <input type="hidden" name="meetingId" value={meeting.id} />
                        <input type="hidden" name="status" value={status || myAttendance?.status || ''} />
                        
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setStatus('GOING')} className={`flex-1 py-3 rounded-xl font-bold border-2 flex items-center justify-center gap-2 ${(status || myAttendance?.status) === 'GOING' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}><CheckCircle2 className="w-5 h-5"/> Přijdu</button>
                          <button type="button" onClick={() => setStatus('NOT_GOING')} className={`flex-1 py-3 rounded-xl font-bold border-2 flex items-center justify-center gap-2 ${(status || myAttendance?.status) === 'NOT_GOING' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}><XCircle className="w-5 h-5"/> Nepřijdu</button>
                        </div>

                        {/* Omluvenka - povinná pokud je status NOT_GOING */}
                        {(status === 'NOT_GOING' || (myAttendance?.status === 'NOT_GOING' && !status)) && (
                          <div className="pt-2">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Důvod absence (povinné)</label>
                            <textarea name="note" required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Musím k zubaři..." className="w-full p-3 border rounded-xl bg-white border-gray-200 outline-none h-20" />
                          </div>
                        )}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold">Uložit rozhodnutí</button>
                      </form>
                    )}
                  </div>

                  {/* Výpis pro vedoucí */}
                  {canManage && (
                    <div className="mt-6 border-t pt-6">
                       <h3 className="font-bold text-gray-900 mb-4">Seznam omluvenek</h3>
                       {meeting.attendance.filter((a:any) => a.status === 'NOT_GOING').map((a:any) => (
                         <div key={a.id} className="bg-red-50 p-3 rounded-lg mb-2 text-sm border border-red-100">
                           <span className="font-bold">{a.user.name}:</span> {a.note}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {meeting.messages.length === 0 ? (
                      <p className="text-gray-400 text-center text-sm italic mt-10">Zatím tu nejsou žádné zprávy. Napiš jako první!</p>
                    ) : (
                      meeting.messages.map((msg: any) => (
                        <div key={msg.id} className={`flex flex-col ${msg.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.user.name}</span>
                          <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.userId === currentUser.id ? 'bg-[#1a237e] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form action={sendMessage} className="mt-4 flex gap-2">
                    <input type="hidden" name="meetingId" value={meeting.id} />
                    <input type="text" name="text" required placeholder="Napiš zprávu družině..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" />
                    <button type="submit" className="p-3 bg-[#00c853] text-white rounded-xl hover:bg-green-600 transition-colors"><Send className="w-5 h-5"/></button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}