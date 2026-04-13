import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

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
        console.log(data)
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
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId)
      setUser(user)
    }
  }, [connections])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  return (
    <div className='flex flex-col h-screen'>
      <div onClick={() => navigate(`/profile/${userId}`)} className='flex items-center gap-2 p-2 md:px-10 xl:pl-40 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-300 cursor-pointer'>
        <img src={user?.profile_picture} alt="" className='size-8 rounded-full' />
        <div>
          <p className='font-medium'>{user?.full_name}</p>
          <p className='text-sm text-gray-500 -m-1.5'>@{user?.username}</p>
        </div>
      </div>
      <div className='p-3 md:p-5 flex-1 overflow-y-scroll'>
        <div className='space-y-4 max-w-full'>
          {
            messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => {
              const isOwnMessage = message.from_user_id === currentUserId
              return (
                <div key={index} className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                  <div className={`p-2 text-sm max-w-[80%] sm:max-w-sm rounded-lg shadow ${isOwnMessage ? "bg-indigo-500 text-white rounded-br-none" : "bg-white text-gray-900 rounded-bl-none"}`}>
                    {
                      message.message_type === "image" && <img src={message.media_url} alt=""
                        className='w-full max-w-sm mb-1 rounded-lg' />
                    }
                    <p>{message.text}</p>
                  </div>
                </div>
              )
            })
          }
          <div ref={messagesEndRef}>

          </div>
        </div>
      </div>

      <div className='px-3 pb-4 md:px-4'>
        <div className='flex items-center gap-2 pl-3 bg-white w-full border border-gray-200 shadow rounded-full'>
          <input type="text" className='flex-1 outline-none text-slate-700 text-sm'
            placeholder='Type a message...'
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text} />
          <label htmlFor="image">
            {
              image ? <img src={URL.createObjectURL(image)} alt="" className='h-6 rounded' /> :
                <ImageIcon className='size-5 text-gray-400 cursor-pointer' />
            }
            <input type='file' id='image' accept='image/*' hidden
              onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button onClick={sendMessage} className='bg-linear-to-r from-indigo-500 to-purple-600
          hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-1.5 rounded-full'>
            <SendHorizonal className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
