import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Notifications from './pages/Notifications'
import Layout from './pages/Layout'
import StoriesBar from './components/StoriesBar'
import StoryModal from './components/StoryModal'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth, useUser } from '@clerk/react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionsSlice.js'
import { addMessage } from './features/messages/messagesSlice.js'
import { fetchNotifications, addRealtimeNotification } from './features/notifications/notificationsSlice.js'


import socket from './api/socket'

const App = () => {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)

  if (!isLoaded) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-50 to-white'>
        <div className='w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3'></div>
        <p className='text-indigo-600 font-bold text-2xl tracking-wide'>Socialy</p>
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
        dispatch(fetchNotifications(token))
      }

    }
    fetchData()
  }, [user, getToken, dispatch])


  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (user) {
      // Join user room for WebSocket real-time updates
      socket.emit("join", user.id)

      const handleNewMessage = (message) => {
        if (pathnameRef.current === ("/messages/" + message.from_user_id)) {
          dispatch(addMessage(message))
        }
      }

      const handleNewNotification = (notification) => {
        dispatch(addRealtimeNotification(notification))
        const senderName = notification.sender?.full_name || 'Someone'
        let toastMsg = 'New notification'
        if (notification.type === 'like_post') toastMsg = `${senderName} liked your post`
        else if (notification.type === 'like_comment') toastMsg = `${senderName} liked your comment`
        else if (notification.type === 'comment') toastMsg = `${senderName} commented on your post`
        else if (notification.type === 'connection_request') toastMsg = `${senderName} sent you a connection request`
        else if (notification.type === 'connection_accept') toastMsg = `${senderName} accepted your connection request`

        toast.success(toastMsg, {
          icon: '🔔',
          style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '13px' }
        })
      }

      socket.on("new_message", handleNewMessage)
      socket.on("new_notification", handleNewNotification)

      // Fallback SSE connection
      const eventSource = new EventSource(import.meta.env.VITE_BASE_URL + "/api/message/" + user.id)
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.sseType === 'notification' && data.notification) {
          handleNewNotification(data.notification)
        } else if (data.from_user_id) {
          handleNewMessage(data)
        }
      }

      return () => {
        socket.off("new_message", handleNewMessage)
        socket.off("new_notification", handleNewNotification)
        eventSource.close()
      }
    }
  }, [user, dispatch])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <Layout /> : <Login />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='notifications' element={<Notifications />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='createpost' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;

