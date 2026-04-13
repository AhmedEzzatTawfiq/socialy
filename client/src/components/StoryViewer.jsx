import { BadgeCheck, X, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const StoryViewer = ({ viewStory, setViewStory, fetchStories }) => {
    const [progress, setProgress] = useState(0)
    const { getToken } = useAuth()

    const handleClose = () => setViewStory(null)

    const handleDeleteStory = async () => {
        try {
            const { data } = await api.post("/api/story/delete", { storyId: viewStory._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success(data.message)
                handleClose()
                if (fetchStories) fetchStories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const renderContent = () => {
        switch (viewStory.media_type) {
            case "image":
                return <img src={viewStory.media_url} alt="" className='w-full h-full object-cover' />
            case "video":
                return <video onEnded={handleClose} controls autoPlay src={viewStory.media_url} className='w-full h-full object-cover' />
            case "text":
                return (
                    <div
                        className='w-screen h-screen flex items-center justify-center p-8 text-white text-2xl sm:text-3xl text-center'
                        style={{ backgroundColor: viewStory.background_color || '#4f46e3' }}
                    >
                        {viewStory.content}
                    </div>
                )
            default:
                return null
        }
    }

    useEffect(() => {
        if (!viewStory) return
        let timer, progressInterval

        if (viewStory.media_type !== "video") {
            setProgress(0)
            const duration = 10000
            const step = 100
            let elapsed = 0

            progressInterval = setInterval(() => {
                elapsed += step
                setProgress((elapsed / duration) * 100)
            }, step)

            timer = setTimeout(() => setViewStory(null), duration)
        }

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
        }
    }, [viewStory, setViewStory])

    if (!viewStory) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black'>
            {/* Progress Bar */}
            <div className='absolute top-0 left-0 w-full h-1 bg-white/30'>
                <div
                    className='h-1 bg-white transition-all duration-100 linear'
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* User Info */}
            <div className='absolute top-4 left-4 flex items-center gap-3 backdrop-blur-md bg-black/50 p-2 rounded-xl'>
                <img
                    src={viewStory.user?.profile_picture}
                    alt=""
                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white'
                />
                <div className='flex flex-col'>
                    <div className='flex items-center gap-1 text-white font-medium'>
                        <span>{viewStory.user?.full_name || viewStory.user?.username || 'Unknown'}</span>
                        <BadgeCheck size={16} />
                    </div>
                    <span className='text-white/70 text-xs'>
                        {moment(viewStory.createdAt).fromNow()}
                    </span>
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className='absolute top-4 right-4 text-white hover:scale-110 transition-transform cursor-pointer'
            >
                <X className='w-8 h-8' />
            </button>

            {/* Delete Button (only for own stories) */}
            {viewStory.user?._id === viewStory.currentUserId && (
                <button
                    onClick={handleDeleteStory}
                    className='absolute top-4 right-16 text-white hover:scale-110 transition-transform cursor-pointer'
                >
                    <Trash2 className='w-8 h-8' />
                </button>
            )}

            {/* Story Content */}
            <div className='w-full h-full flex items-center justify-center'>
                {renderContent()}
            </div>
        </div>
    )
}

export default StoryViewer



