import React, { useState, useEffect } from 'react'
import { assets, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
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

  useEffect(() => {
    fetchFeeds()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex flex-col xl:flex-row h-full py-10 px-4 xl:px-10 gap-6 overflow-y-auto'>
      {/* Main Feed */}
      <div className='flex-1 max-w-3xl mx-auto xl:mx-0'>
        <StoriesBar />
        <div className='mt-6 flex flex-col gap-6'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Sidebar on the right */}
      <div className='hidden xl:flex flex-col w-80 sticky gap-6'>
        <div className='bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-300'>
          <h2 className='text-lg font-semibold text-gray-800'>Sponsored</h2>
          <img src={assets.sponsored_img} alt="Sponsored" className='w-full h-64 object-cover rounded-md' />
          <p className='text-gray-700 font-medium'>Email Marketing</p>
          <p className='text-gray-400 text-sm'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
        </div>
        <RecentMessages />
      </div>
    </div>
  )
}

export default Feed
