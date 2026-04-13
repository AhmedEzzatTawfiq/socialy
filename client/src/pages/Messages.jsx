import React from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyConnectionsData } from '../assets/assets'
import { Eye, MessageSquare } from 'lucide-react'
import { useSelector } from 'react-redux'

const Messages = () => {
  const navigate = useNavigate()
  const connections = useSelector((state) => state.connections.connections)
  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
          <p className='text-slate-600 text-sm sm:text-base'>
            Talk to your friends and family
          </p>
        </div>
        <div className='flex flex-col gap-3'>
          {
            connections.map((user) => (
              <div key={user._id} className='max-w-xl flex flex-wrap gap-3 sm:gap-5 p-4 sm:p-6 bg-white shadow rounded-md'>
                <img src={user.profile_picture} alt="" className='rounded-full size-10 sm:size-12 mx-auto' />
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-slate-700 text-sm sm:text-base truncate'>{user.full_name}</p>
                  <p className='text-slate-500 text-xs sm:text-sm truncate'>{user.username}</p>
                  <p className='text-xs sm:text-sm text-gray-600 line-clamp-2'>{user.bio}</p>
                </div>
                <div className='flex flex-col gap-2 mt-2 sm:mt-4'>
                  <button onClick={() => navigate(`/messages/${user._id}`)} className='size-8 sm:size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95
                  transition cursor-pointer gap-1'
                  >
                    <MessageSquare className='w-4 h-4' />
                  </button>
                  <button onClick={() => navigate(`/profile/${user._id}`)} className='size-8 sm:size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95
                  transition cursor-pointer gap-1'
                  >
                    <Eye className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Messages
