import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import moment from 'moment'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const StoriesBar = () => {
    const [stories, setStories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewStory, setViewStory] = useState(null)

    const { getToken } = useAuth()

    const fetchStories = async () => {
        try {
            const token = await getToken()

            const { data } = await api.get("/api/story/get", {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setStories(Array.isArray(data.stories) ? data.stories : [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        fetchStories()
    }, [])

    return (
        <div className='w-full overflow-x-auto py-4'>
            <div className='flex gap-4 px-4'>

                {/* Create Story */}
                <div
                    onClick={() => setShowModal(true)}
                    className='flex flex-col items-center justify-center w-20 h-32 bg-indigo-500 rounded-xl cursor-pointer hover:scale-105 transition shadow-md'
                >
                    <div className='flex items-center justify-center w-10 h-10 bg-white rounded-full'>
                        <Plus className='text-indigo-500 w-5 h-5' />
                    </div>
                    <p className='text-sm font-medium text-white mt-2 text-center'>
                        Create Story
                    </p>
                </div>

                {/* Stories */}
                {Array.isArray(stories) && stories.map((story, index) => (
                    <div
                        key={story._id || index}
                        onClick={() => setViewStory(story)}
                        className='relative w-20 h-32 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition shadow-md'
                    >

                        {/* Profile */}
                        {story.user?.profile_picture ? (
                            <img
                                src={story.user.profile_picture}
                                alt=""
                                className='absolute w-8 h-8 top-2 left-2 z-10 rounded-full ring-2 ring-white'
                            />
                        ) : (
                            <img
                                src="/default-avatar.png"
                                alt=""
                                className='absolute w-8 h-8 top-2 left-2 z-10 rounded-full ring-2 ring-white'
                            />
                        )}

                        {/* Media */}
                        {story.media_type !== "text" && story.media_url ? (
                            <div className='absolute inset-0 bg-black'>
                                {story.media_type === "image" ? (
                                    <img src={story.media_url} alt="" className='h-full w-full object-cover' />
                                ) : (
                                    <video src={story.media_url} className='h-full w-full object-cover' />
                                )}
                            </div>
                        ) : (
                            <div className='absolute h-full flex items-center justify-center px-2 py-3 bg-indigo-600 text-white text-xs text-center'>
                                {story.content}
                            </div>
                        )}

                        {/* Time */}
                        <p className='absolute bottom-1 right-2 text-white text-xs z-10'>
                            {moment(story.createdAt).fromNow()}
                        </p>

                    </div>
                ))}

            </div>

            {/* Modals */}
            {showModal && (
                <StoryModal
                    setShowModal={setShowModal}
                    fetchStories={fetchStories} // ✅ fixed
                />
            )}

            {viewStory && (
                <StoryViewer
                    viewStory={viewStory}
                    setViewStory={setViewStory}
                />
            )}
        </div>
    )
}

export default StoriesBar