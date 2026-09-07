import React, { useState } from 'react'
import { MessageSquare, Search, MessageCircle, Clock, Sparkles } from 'lucide-react'
import { useRecentConversations } from '../hooks/useRecentConversations'
import ConversationCard from '../components/ConversationCard'
import ConnectionCard from '../components/ConnectionCard'

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { filteredRecent, filteredOther, loading, recentConversations } = useRecentConversations(searchQuery)

  return (
    <div className='min-h-screen bg-slate-50/50 pb-20 sm:pb-12'>
      <div className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-8'>
        
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5'>
              <MessageCircle className='w-7 h-7 text-indigo-600' />
              Messages
            </h1>
            <p className='text-slate-500 text-sm mt-1 font-medium'>
              Your recent conversations and connections
            </p>
          </div>

          {/* Search bar */}
          <div className='relative max-w-xs w-full'>
            <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
            <input
              type='text'
              placeholder='Search messages...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all'
            />
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3].map((n) => (
              <div key={n} className='p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 animate-pulse'>
                <div className='w-12 h-12 rounded-full bg-slate-200 shrink-0' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-slate-200 rounded w-1/3' />
                  <div className='h-3 bg-slate-100 rounded w-1/2' />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-8'>
            
            {/* Recent Conversations Section */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5 text-slate-400' />
                  Recent Conversations
                </h2>
                {recentConversations.length > 0 && (
                  <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100'>
                    {recentConversations.length}
                  </span>
                )}
              </div>

              {filteredRecent.length === 0 ? (
                searchQuery ? (
                  <div className='bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs'>
                    <p className='text-slate-500 text-sm'>No conversations match "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className='bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs flex flex-col items-center justify-center'>
                    <div className='w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3'>
                      <MessageSquare className='w-6 h-6' />
                    </div>
                    <h3 className='text-base font-semibold text-slate-800 mb-1'>No messages yet</h3>
                    <p className='text-slate-500 text-xs max-w-sm mb-4'>
                      Start a chat with your connections below to send your first message!
                    </p>
                  </div>
                )
              ) : (
                <div className='flex flex-col gap-3'>
                  {filteredRecent.map((conv) => (
                    <ConversationCard
                      key={conv.partner._id}
                      partner={conv.partner}
                      lastMessage={conv.lastMessage}
                      isFromMe={conv.isFromMe}
                      unreadCount={conv.unreadCount}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Other Connections Section */}
            {filteredOther.length > 0 && (
              <div>
                <h2 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5'>
                  <Sparkles className='w-3.5 h-3.5 text-slate-400' />
                  Start a Chat with Connections
                </h2>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {filteredOther.map((userConn) => (
                    <ConnectionCard key={userConn._id} userConn={userConn} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
