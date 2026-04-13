import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import { useParams, Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import UserProfileInfo from '../components/UserProfileInfo'
import Loading from '../components/Loading'
import ProfileModel from '../components/ProfileModel'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const Profile = () => {
  const { profileId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, serPosts] = useState([])
  const [activeTab, setActiveTab] = useState("posts")
  const [showEdit, setShowEdit] = useState(false)

  const { getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const currentUser = useSelector((state) => state.user.value)

  const fetchUser = async (profileId) => {
    const token = await getToken()
    try {
      const { data } = await api.post("/api/user/profiles", { profileId }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        setUser(data.profile)
        serPosts(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }

  const handleDeletePost = (postId) => {
    serPosts(prev => prev.filter(post => post._id !== postId))
  }

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId)
    } else if (currentUser?._id) {
      fetchUser(currentUser._id)
    } else if (clerkUser?.id) {
      fetchUser(clerkUser.id)
    }
  }, [profileId, currentUser, clerkUser])
  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          <div className='h-40 md:h-56 bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {
              user.cover_photo && <img src={user.cover_photo} alt="" className='w-full h-full object-cover' />
            }
          </div>
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>
        <div className='mt-6'>
          <div className='bg-white flex rounded-xl shadow p-1 max-w-md mx-auto'>
            {
              ["posts", "media"].map((tab) => (
                <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${activeTab === tab ? "bg-indigo-600 text-white" : "to-gray-600 hover:text-gray-900"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))
            }
          </div>
          {
            activeTab === "posts" && (
              <div className='mt-6 flex flex-col items-center gap-6'>
                {
                  posts.map((post) => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
                }
              </div>
            )
          }
          {
            activeTab === "media" && (
              <div className='flex flex-wrap mt-6 max-w-6xl gap-3'>
                {
                  posts.filter((post) => post.image_urls && post.image_urls.length > 0).map((post) => (
                    post.image_urls.map((image, index) => (
                      <a href={image} target='_blank' rel='noopener noreferrer' key={`${post._id}-${index}`} className='relative group cursor-pointer'>
                        <img src={image} alt="" className='w-64 h-48 object-cover rounded-lg' />
                        <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </a>
                    ))
                  ))
                }
                {posts.filter((post) => post.image_urls && post.image_urls.length > 0).length === 0 && (
                  <div className='w-full text-center py-12 text-gray-500'>
                    No media posts yet
                  </div>
                )}
              </div>
            )
          }
        </div>
      </div>
      {showEdit && <ProfileModel setShowEdit={setShowEdit} />}
    </div>
  ) : <Loading />
}

export default Profile
