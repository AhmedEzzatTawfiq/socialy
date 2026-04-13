import React, { useState, useEffect } from 'react'
import { assets, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import CreatePost from '../components/CreatePost'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchFeeds = async () => {
    try {
      const token = await getToken()
      setLoading(true)
      const { data } = await api.get('/api/post/feed', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        setFeeds(data.posts || [])
      } else {
        toast.error(data.message || 'Failed to fetch feeds')
        setFeeds([])
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch feeds')
      setFeeds([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (postId) => {
    setFeeds(prev => prev.filter(post => post._id !== postId))
  }

  const handlePostCreated = () => {
    fetchFeeds()
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex flex-col lg:flex-row h-full py-6 sm:py-10 px-2 sm:px-4 lg:px-10 gap-4 sm:gap-6 overflow-y-auto'>
      {/* Main Feed */}
      <div className='flex-1 max-w-3xl mx-auto lg:mx-0 w-full'>
        <StoriesBar />
        <CreatePost onPostCreated={handlePostCreated} />
        <div className='mt-4 sm:mt-6 flex flex-col gap-4 sm:gap-6'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      </div>

      {/* Sidebar on the right */}
      <div className='hidden lg:flex flex-col w-72 xl:w-80 sticky gap-6'>
        <RecentMessages />
      </div>
    </div>
  )
}

export default Feed
