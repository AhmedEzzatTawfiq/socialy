import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'
import api from '../api/axios'

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages)
  const { userId } = useParams()
  const { userId: currentUserId, getToken } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [text, setText] = useState("")
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)

  const connections = useSelector((state) => state.connections.connections)

  const fetchUserMessages = async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({ token, userId }))
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendMessage = async () => {
    try {
      if (!text && !image) return
      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      image && formData.append('image', image)
      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setText("")
        setImage(null)
        dispatch(addMessage(data.message))
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchUserMessages()
    return () => {
      dispatch(resetMessages())
    }
  }, [userId])

  useEffect(() => {
    const fetchTargetUser = async () => {
      if (connections && connections.length > 0) {
        const found = connections.find(connection => connection._id === userId)
        if (found) {
          setUser(found)
          return
        }
      }
      try {
        const token = await getToken()
        const { data } = await api.post("/api/user/profiles", { profileId: userId }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) {
          setUser(data.profile)
        }
      } catch (error) {
        console.error("Error loading chat target user:", error)
      }
    }
    if (userId) {
      fetchTargetUser()
    }
  }, [userId, connections, getToken])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className='flex flex-col h-full overflow-hidden bg-slate-50'>
      {/* Header */}
      <div 
        onClick={() => navigate(`/profile/${userId}`)} 
        className='flex items-center gap-3 p-3 md:px-10 xl:pl-40 bg-white border-b border-gray-200 cursor-pointer shrink-0 shadow-xs'
      >
        <img 
          src={user?.profile_picture || '/default-avatar.png'} 
          alt={user?.full_name || 'Chat'} 
          className='w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0' 
        />
        <div>
          <p className='font-semibold text-gray-900 text-sm md:text-base leading-tight'>{user?.full_name || 'Chat'}</p>
          {user?.username && <p className='text-xs text-gray-500'>@{user?.username}</p>}
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className='p-3 md:p-5 flex-1 overflow-y-auto space-y-4'>
        {messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => {
          const isOwnMessage = message.from_user_id === currentUserId
          return (
            <div key={index} className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
              <div className={`p-3 text-sm max-w-[85%] sm:max-w-md rounded-2xl shadow-xs ${isOwnMessage ? "bg-indigo-600 text-white rounded-br-xs" : "bg-white text-gray-900 rounded-bl-xs border border-gray-100"}`}>
                {message.message_type === "image" && (
                  <img src={message.media_url} alt="" className='w-full max-w-sm mb-2 rounded-xl object-cover' />
                )}
                <p className='leading-relaxed wrap-break-word'>{message.text}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className='p-3 pb-4 md:px-4 shrink-0 bg-slate-50 border-t border-gray-100'>
        <div className='flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-white w-full border border-gray-200 shadow-xs rounded-full'>
          <input 
            type="text" 
            className='flex-1 outline-none text-slate-800 text-sm bg-transparent'
            placeholder='Type a message...'
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text} 
          />
          <label htmlFor="image" className='p-1.5 hover:bg-gray-100 rounded-full transition cursor-pointer'>
            {image ? (
              <img src={URL.createObjectURL(image)} alt="" className='h-6 w-6 object-cover rounded' />
            ) : (
              <ImageIcon className='w-5 h-5 text-gray-400' />
            )}
            <input 
              type='file' 
              id='image' 
              accept='image/*' 
              hidden
              onChange={(e) => setImage(e.target.files[0])} 
            />
          </label>
          <button 
            onClick={sendMessage} 
            className='bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full shadow-xs transition'
          >
            <SendHorizonal className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
