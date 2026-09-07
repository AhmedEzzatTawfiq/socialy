import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { useSelector } from 'react-redux'
import api from '../api/axios'

export const useRecentConversations = (searchQuery = '') => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const connections = useSelector((state) => state.connections.connections) || []
  const [recentConversations, setRecentConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRecentMessages = useCallback(async () => {
    if (!user) return
    try {
      const token = await getToken()
      const { data } = await api.post("/api/message/recent-messages", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        const grouped = data.messages.reduce((acc, msg) => {
          const senderId = typeof msg.from_user_id === 'object' ? msg.from_user_id?._id : msg.from_user_id
          const isFromMe = senderId === user?.id
          const partner = isFromMe ? msg.to_user_id : msg.from_user_id

          if (!partner || !partner._id || partner._id === user?.id) return acc
          const partnerId = partner._id

          if (!acc[partnerId] || new Date(msg.createdAt) > new Date(acc[partnerId].lastMessage.createdAt)) {
            acc[partnerId] = {
              partner,
              lastMessage: msg,
              isFromMe,
              unreadCount: (!isFromMe && !msg.seen) ? 1 : 0
            }
          } else if (!isFromMe && !msg.seen) {
            acc[partnerId].unreadCount += 1
          }
          return acc
        }, {})

        const sorted = Object.values(grouped).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
        setRecentConversations(sorted)
      }
    } catch (error) {
      console.error("Failed to fetch recent messages:", error)
    } finally {
      setLoading(false)
    }
  }, [user, getToken])

  useEffect(() => {
    if (user) {
      fetchRecentMessages()
      const interval = setInterval(fetchRecentMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [user, fetchRecentMessages])

  // Get partner IDs in recent conversations
  const recentPartnerIds = new Set(recentConversations.map(c => c.partner._id))

  // Connections that don't have recent messages yet
  const otherConnections = connections.filter(conn => conn && conn._id && !recentPartnerIds.has(conn._id))

  // Filtered lists based on search query
  const query = searchQuery.trim().toLowerCase()

  const filteredRecent = recentConversations.filter(c =>
    !query ||
    c.partner.full_name?.toLowerCase().includes(query) ||
    c.partner.username?.toLowerCase().includes(query)
  )

  const filteredOther = otherConnections.filter(conn =>
    !query ||
    conn.full_name?.toLowerCase().includes(query) ||
    conn.username?.toLowerCase().includes(query)
  )

  return {
    recentConversations,
    filteredRecent,
    filteredOther,
    loading,
    refetch: fetchRecentMessages
  }
}
