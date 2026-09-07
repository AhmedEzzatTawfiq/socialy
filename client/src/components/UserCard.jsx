import React from 'react'
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

const UserCard = ({ user }) => {
  const currentUser = useSelector(state => state.user.value)
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isFollowing = currentUser?.following?.includes(user._id)

  const handleFollow = async () => {
    try {
      const endpoint = isFollowing ? "/api/user/unfollow" : "/api/user/follow"
      const { data } = await api.post(endpoint, { id: user._id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleConnectionRequest = async () => {
    if (currentUser?.connections?.includes(user._id)) {
      return navigate("/messages/" + user._id)
    }
    try {
      const { data } = await api.post("/api/user/connect", { id: user._id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div key={user._id} className='p-4 pt-6 flex flex-col justify-between border border-gray-200 rounded-md bg-white shadow-xs'>
      <div className='text-center cursor-pointer' onClick={() => navigate(`/profile/${user._id}`)}>
        <img src={user.profile_picture || '/default-avatar.png'} alt="" className='rounded-full w-16 h-16 object-cover shadow-md mx-auto hover:scale-105 transition-transform' />
        <p className='mt-4 font-semibold hover:text-indigo-600 transition-colors'>{user.full_name}</p>
        {
          user.username && <p className='text-gray-500 font-light text-sm'>@{user.username}</p>
        }
        {
          user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4 line-clamp-2'>{user.bio}</p>
        }
      </div>
      <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
        <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
          <MapPin className='w-3.5 h-3.5' /> {user.location || "Earth"}
        </div>
        <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
          <span>{user.followers?.length || 0}</span> Followers
        </div>
      </div>
      <div className='flex mt-4 gap-2'>
        <button 
          onClick={handleFollow} 
          className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 font-medium active:scale-95 transition text-xs sm:text-sm cursor-pointer ${
            isFollowing
              ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
              : "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          }`}
        >
          <UserPlus className='w-4 h-4' />
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
        <button 
          onClick={() => navigate("/messages/" + user._id)} 
          title="Message"
          className='flex items-center justify-center px-3 border border-gray-300 text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer active:scale-95 transition'
        >
          <MessageCircle className='w-5 h-5' />
        </button>
        {!currentUser?.connections?.includes(user._id) && (
          <button 
            onClick={handleConnectionRequest} 
            title="Connect"
            className='flex items-center justify-center px-3 border border-gray-300 text-slate-600 hover:bg-gray-50 rounded-md cursor-pointer active:scale-95 transition'
          >
            <Plus className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  )
}

export default UserCard
