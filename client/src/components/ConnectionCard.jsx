import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Eye } from 'lucide-react'

const ConnectionCard = ({ userConn }) => {
  const navigate = useNavigate()

  return (
    <div className='p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-xs flex items-center justify-between gap-3'>
      <div className='flex items-center gap-3 min-w-0'>
        <img
          src={userConn.profile_picture || 'https://via.placeholder.com/150'}
          alt={userConn.full_name}
          className='w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100'
        />
        <div className='min-w-0'>
          <p className='font-semibold text-slate-900 text-sm truncate'>{userConn.full_name}</p>
          <p className='text-slate-400 text-xs truncate'>@{userConn.username}</p>
        </div>
      </div>

      <div className='flex items-center gap-1.5 shrink-0'>
        <button
          onClick={() => navigate(`/messages/${userConn._id}`)}
          className='px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-medium transition-all active:scale-95 flex items-center gap-1'
        >
          <MessageSquare className='w-3.5 h-3.5' />
          <span>Message</span>
        </button>
        <button
          onClick={() => navigate(`/profile/${userConn._id}`)}
          className='p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs transition-all active:scale-95'
          title='View Profile'
        >
          <Eye className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  )
}

export default ConnectionCard
