import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../assets/assets'
import { Plus } from 'lucide-react'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import moment from 'moment'

const StoriesBar = () => {
    const [stories, setStories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewStory, setViewStory] = useState(null)

    const fetchStories = async () => {
        setStories(dummyStoriesData)
    }

    useEffect(() => {
        fetchStories()
    }, [])

    return (
        <div className='w-full overflow-x-auto py-4'>
            <div className='flex gap-4 px-4'>
                {/* Create Story Button */}
                <div
                    onClick={() => setShowModal(true)}
                    className='flex flex-col items-center justify-center w-20 h-32 bg-indigo-500 rounded-xl cursor-pointer hover:scale-105 transform transition duration-200 shadow-md'
                >
                    <div className='flex items-center justify-center w-10 h-10 bg-white rounded-full'>
                        <Plus className='text-indigo-500 w-5 h-5' />
                    </div>
                    <p className='text-sm font-medium text-white mt-2 text-center'>Create Story</p>
                </div>

                {/* Story Items */}
                {stories.map((story, index) => (
                    <div
                        key={index}
                        onClick={() => setViewStory(story)}
                        className='relative w-20 h-32 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transform transition duration-200 shadow-md'
                    >
                        {/* Profile Picture */}
                        <img
                            src={story.user.profile_picture}
                            alt=""
                            className='absolute w-8 h-8 top-2 left-2 z-10 rounded-full ring-2 ring-white shadow-sm'
                        />

                        {/* Content overlay */}
                        {story.media_type !== "text" && (
                            <div className='absolute inset-0 rounded-xl bg-black overflow-hidden'>
                                {story.media_type === "image" ? (
                                    <img src={story.media_url} alt="" className='h-full w-full object-cover' />
                                ) : (
                                    <video src={story.media_url} className='h-full w-full object-cover' />
                                )}
                            </div>
                        )}

                        {/* Text content */}
                        {story.media_type === "text" && (
                            <div className='absolute h-full text-[7px] flex items-center justify-center px-2 py-3 bg-indigo-600 text-white text-xs text-center'>
                                {story.content}
                            </div>
                        )}

                        {/* Timestamp */}
                        <p className='absolute bottom-1 right-2 text-white text-xs z-10'>
                            {moment(story.createdAt).fromNow()}
                        </p>
                    </div>
                ))}
            </div>

            {showModal && <StoryModal setShowModal={setShowModal} fethStories={fetchStories} />}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
        </div>
    )
}

export default StoriesBar