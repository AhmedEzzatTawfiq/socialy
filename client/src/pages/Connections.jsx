import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, User, Users } from 'lucide-react'
import { useAuth } from '@clerk/react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchConnections } from '../features/connections/connectionsSlice'
import { useEffect } from 'react'

const Connections = () => {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState("Followers")
  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)
  const dispatch = useDispatch()
  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: Users },
    { label: "Pending", value: pendingConnections, icon: Users },
    { label: "Connections", value: connections, icon: Users },
  ]
  const { getToken } = useAuth()

  const handleUnfollow = async (userId) => {
    const token = await getToken()
    try {
      const { data } = await api.post("/api/user/unfollow", { id: userId }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }

  const acceptConnections = async (userId) => {
    try {
      const { data } = await api.post("/api/user/accept", { id: userId }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token))
    })
  }, [dispatch, getToken])
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600 text-sm sm:text-base'>
            Manage your network and discover new connections
          </p>
        </div>
        <div className='mb-6 sm:mb-8 flex flex-wrap gap-3 sm:gap-6 justify-center'>
          {
            dataArray.map((item, index) => (
              <div key={index} className='flex flex-col items-center justify-center gap-1 border border-gray-200 h-16 sm:h-20 w-32 sm:w-40 bg-white shadow rounded-md'>
                <b className='text-lg sm:text-xl'>{item.value.length}</b>
                <p className='text-slate-600 text-xs sm:text-sm'>{item.label}</p>
              </div>
            ))
          }
        </div>
        <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md py-1 bg-white shadow-sm w-full'>
          {
            dataArray.map((tab) => (
              <button onClick={() => setCurrentTab(tab.label)} key={tab.label} className={`flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors cursor-pointer
              ${currentTab === tab.label ? "bg-white font-medium text-black" : "text-gray-500 hover:text-black"}`}>
                <tab.icon className="w-4 h-4" />
                <span className='ml-1'>{tab.label}</span>
                {
                  tab.count !== undefined && (
                    <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>

                      {tab.label}

                    </span>
                  )
                }
              </button>
            ))
          }
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {
            dataArray.find((item) => item.label === currentTab).value.length > 0 ? (
              dataArray.find((item) => item.label === currentTab).value.map((user) => (
                <div key={user._id} className='flex flex-col gap-4 p-4 sm:p-5 bg-white shadow rounded-lg'>
                  <div className='flex gap-3 sm:gap-4 items-start'>
                    <img src={user.profile_picture} alt="" className='rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-md shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-slate-700 text-sm sm:text-base truncate'>{user.full_name}</p>
                      <p className='text-slate-500 text-xs sm:text-sm truncate'>@{user.username}</p>
                      <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1'>{user.bio}</p>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <button onClick={() => navigate(`/profile/${user._id}`)} className='flex-1 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 p-2 text-xs sm:text-sm rounded-lg text-white active:scale-95 transition cursor-pointer'>
                      View Profile
                    </button>

                    {
                      currentTab === "Following" && (
                        <button onClick={() => handleUnfollow(user._id)} className='flex-1 p-2 text-xs sm:text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                          Unfollow
                        </button>
                      )
                    }
                    {
                      currentTab === "Pending" && (
                        <button onClick={() => acceptConnections(user._id)} className='flex-1 p-2 text-xs sm:text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                          Accept
                        </button>
                      )
                    }
                    {
                      currentTab === "Connections" && (
                        <button className='flex-1 flex justify-center items-center gap-1 p-2 text-xs sm:text-sm rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-95 transition cursor-pointer'>
                          <MessageSquare className='w-4 h-4' />
                          Message
                        </button>
                      )
                    }
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full text-center py-12 sm:py-20 bg-white rounded-lg shadow'>
                <Users className='w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 text-base sm:text-lg'>
                  {currentTab === "Followers" && "You don't have any followers yet"}
                  {currentTab === "Following" && "You don't follow any person yet"}
                  {currentTab === "Pending" && "You don't have any pending requests"}
                  {currentTab === "Connections" && "You don't have any connections yet"}
                </p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Connections
