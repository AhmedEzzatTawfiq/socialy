import React, { useEffect, useState } from 'react'
import { dummyRecentMessagesData } from '../assets/assets'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Image, Video } from 'lucide-react'

const RecentMessages = () => {
    const [messages, setMessages] = useState([])
    const { user } = useUser()
    const { getToken } = useAuth()
    const fetchRecentMessages = async () => {
        try {
            const { data } = await api.post("/api/message/recent-messages", {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                const groupedMessages = data.messages.reduce((acc, message) => {
                    const senderId = typeof message.from_user_id === 'object' ? message.from_user_id?._id : message.from_user_id
                    const isFromMe = senderId === user?.id
                    const partner = isFromMe ? message.to_user_id : message.from_user_id
                    if (!partner || !partner._id) return acc
                    const partnerId = partner._id

                    if (!acc[partnerId] || new Date(message.createdAt) > new Date(acc[partnerId].createdAt)) {
                        acc[partnerId] = {
                            ...message,
                            partner,
                            isFromMe
                        }
                    }
                    return acc
                }, {})
                const sortedMessages = Object.values(groupedMessages).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                setMessages(sortedMessages)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchRecentMessages()
            const interval = setInterval(fetchRecentMessages, 15000)
            return () => clearInterval(interval)
        }
    }, [user])
    return (
        <div className='bg-white max-w-xs p-4 min-h-20 rounded-md shadow text-shadow-2xs to-slate-800'>
            <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar divide-y divide-slate-100'>
                {messages.length === 0 ? (
                    <p className='text-slate-400 text-xs text-center py-4'>No recent messages</p>
                ) : (
                    messages.map((item, index) => {
                        const partner = item.partner
                        return (
                            <Link to={`/messages/${partner._id}`} key={index} className='flex items-start gap-3 py-2.5 hover:bg-slate-50 cursor-pointer rounded transition px-1'>
                                <img src={partner.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover shrink-0' />
                                <div className='w-full min-w-0'>
                                    <div className='flex justify-between items-center gap-1'>
                                        <p className='font-medium text-xs text-slate-800 truncate'>{partner.full_name}</p>
                                        <p className='text-[10px] text-slate-400 shrink-0'>{moment(item.createdAt).fromNow()}</p>
                                    </div>
                                    <div className='flex justify-between items-center gap-1 mt-0.5'>
                                        <p className='text-xs text-slate-500 truncate'>
                                            {item.isFromMe && <span className='text-slate-400 font-normal'>You: </span>}
                                            {item.text ? item.text : (
                                                item.message_type === 'image' ? (
                                                    <span className='inline-flex items-center gap-1 text-slate-500'><Image className='w-3 h-3' /> Photo</span>
                                                ) : (
                                                    <span className='inline-flex items-center gap-1 text-slate-500'><Video className='w-3 h-3' /> Video</span>
                                                )
                                            )}
                                        </p>
                                        {
                                            !item.isFromMe && !item.seen && <p className='bg-indigo-500 text-white h-4 w-4 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0'>1</p>
                                        }
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default RecentMessages
