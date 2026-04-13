import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const StoriesBar = () => {
    const [stories, setStories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewStory, setViewStory] = useState(null)

    const { getToken } = useAuth()
    const { user: clerkUser } = useUser()
    const currentUser = useSelector(state => state.user.value)

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
        <div className='w-full py-3 sm:py-4'>
            <div className='flex gap-2 sm:gap-3 px-2 justify-start'>

                {/* Create Story - Fixed */}
                <div
                    onClick={() => setShowModal(true)}
                    className='flex flex-col items-center justify-center w-20 h-32 sm:w-24 sm:h-36 bg-indigo-500 rounded-xl cursor-pointer hover:scale-105 transition shadow-md shrink-0'
                >
                    <div className='flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full'>
                        <Plus className='text-indigo-500 w-4 h-4 sm:w-5 sm:h-5' />
                    </div>
                    <p className='text-xs sm:text-sm font-medium text-white mt-2 text-center'>
                        Create Story
                    </p>
                </div>

                {/* Stories - Scrollable */}
                <div className='flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2'>
                    {Array.isArray(stories) && stories.map((story, index) => (
                        <div
                            key={story._id || index}
                            onClick={() => setViewStory(story)}
                            className='relative w-20 h-32 sm:w-24 sm:h-36 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition shadow-md snap-center shrink-0'
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
                                <div
                                    className='absolute inset-0 flex items-center justify-center text-white text-xs text-center'
                                    style={{ backgroundColor: story.background_color || '#4f46e3' }}
                                >
                                    {story.content}
                                </div>
                            )}

                            {/* Account Name */}
                            <p className='absolute bottom-1 left-1.5 text-white text-xs z-10 drop-shadow-md truncate'>
                                {story.user?.full_name || story.user?.username || 'Unknown'}
                            </p>

                        </div>
                    ))}

                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <StoryModal
                    setShowModal={setShowModal}
                    fetchStories={fetchStories}
                />
            )}

            {viewStory && (
                <StoryViewer
                    viewStory={{ ...viewStory, currentUserId: currentUser?._id || clerkUser?.id }}
                    setViewStory={setViewStory}
                    fetchStories={fetchStories}
                />
            )}
        </div>
    )
}

export default StoriesBar