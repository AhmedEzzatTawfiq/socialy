import React from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { MessageSquare, Eye, Image, Video } from 'lucide-react'

const ConversationCard = ({ partner, lastMessage, isFromMe, unreadCount }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/messages/${partner._id}`)}
      className={`group relative p-4 bg-white hover:bg-indigo-50/30 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs flex items-center justify-between gap-4 ${
        unreadCount > 0 ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-100 hover:border-indigo-100'
      }`}
    >
      {/* Left: Avatar + Info */}
      <div className='flex items-center gap-3.5 min-w-0 flex-1'>
        <div className='relative shrink-0'>
          <img
            src={partner.profile_picture || 'https://via.placeholder.com/150'}
            alt={partner.full_name}
            className='w-12 h-12 rounded-full object-cover border border-slate-100 shadow-xs'
          />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse'>
              {unreadCount}
            </span>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2 mb-1'>
            <h3 className='font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors truncate'>
              {partner.full_name}
            </h3>
            <span className='text-[11px] text-slate-400 shrink-0 font-medium'>
              {moment(lastMessage.createdAt).fromNow()}
            </span>
          </div>

          <div className='flex items-center justify-between gap-2'>
            <p className={`text-xs sm:text-sm truncate max-w-md ${
              unreadCount > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'
            }`}>
              {isFromMe && <span className='text-slate-400 font-normal'>You: </span>}
              {lastMessage.text ? (
                lastMessage.text
              ) : lastMessage.message_type === 'image' ? (
                <span className='inline-flex items-center gap-1 text-slate-500 font-medium'>
                  <Image className='w-3.5 h-3.5 text-indigo-500' /> Photo
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-slate-500 font-medium'>
                  <Video className='w-3.5 h-3.5 text-indigo-500' /> Video
                </span>
              )}
            </p>
            <span className='text-xs text-slate-400 font-normal truncate hidden sm:inline-block'>
              @{partner.username}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div
        className='flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => navigate(`/messages/${partner._id}`)}
          className='p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 active:scale-95'
          title='Open Chat'
        >
          <MessageSquare className='w-4 h-4' />
          <span className='hidden sm:inline'>Chat</span>
        </button>
        <button
          onClick={() => navigate(`/profile/${partner._id}`)}
          className='p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-all active:scale-95'
          title='View Profile'
        >
          <Eye className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}

export default ConversationCard
