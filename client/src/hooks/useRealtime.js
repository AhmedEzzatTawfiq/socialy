import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import socket from '../api/socket'
import { fetchUser } from '../features/user/userSlice.js'
import { fetchConnections } from '../features/connections/connectionsSlice.js'
import { addMessage } from '../features/messages/messagesSlice.js'
import { fetchNotifications, addRealtimeNotification } from '../features/notifications/notificationsSlice.js'

export const useRealtime = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  // Initial user data fetch
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

  // Socket and SSE
  useEffect(() => {
    if (user) {
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
}
