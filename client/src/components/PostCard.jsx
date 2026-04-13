import React, { useState, useEffect } from 'react'
import { BadgeCheck, Heart, Key, MessageCircle, Repeat2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'

const PostCard = ({ post, onDelete }) => {
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const [likes, setLikes] = useState(Array.isArray(post.likes_count) ? post.likes_count : [])
    const [showAllComments, setShowAllComments] = useState(false)
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [repostCount, setRepostCount] = useState(post.repost_count || 0)
    const [commentCount, setCommentCount] = useState(post.comments_count || 0)
    const currentUser = useSelector((state) => state.user.value)
    const handleLike = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/like', { postId: post._id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                setLikes(prev => {
                    if (prev.includes(currentUser?._id)) {
                        return prev.filter(id => id !== currentUser._id)
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRepost = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/repost', { postId: post._id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                if (data.reposted) {
                    setRepostCount(prev => prev + 1)
                    toast.success('Post reposted')
                } else {
                    setRepostCount(prev => prev - 1)
                    toast.success('Repost removed')
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleFetchComments = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/comment/${post._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                setComments(data.comments)
                setCommentCount(data.comments.length)
                setShowAllComments(!showAllComments)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleAddComment = async () => {
        if (!commentText.trim()) return
        try {
            const token = await getToken()
            const { data } = await api.post('/api/comment/add', {
                postId: post._id,
                content: commentText
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                setComments(prev => [...prev, data.comment])
                setCommentCount(prev => prev + 1)
                setCommentText('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeletePost = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/delete', { postId: post._id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                toast.success(data.message)
                if (onDelete) onDelete(post._id)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const token = await getToken()
            const { data } = await api.delete(`/api/comment/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                toast.success(data.message)
                setComments(prev => prev.filter(c => c._id !== commentId))
                setCommentCount(prev => prev - 1)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const postWithHashtags = post.content
        ? post.content.replace(
            /(#\w+)/g,
            `<span class="text-indigo-600 font-semibold">$1</span>`
        )
        : ""

    return (
        <div className='bg-white rounded-xl shadow p-3 sm:p-4 space-y-3 sm:space-y-4 w-full max-w-2xl sm:max-w-2xl md:max-w-3xl mx-auto'>
            <div className='flex justify-between items-start'>
                <div onClick={() => navigate(`/profile/${post.user._id}`)} className='inline-flex items-center gap-3 cursor-pointer'>
                    <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow' />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span className='text-sm sm:text-base'>
                                {post.user.full_name}
                            </span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='text-gray-500 text-xs sm:text-sm'>
                            {post.user.username} . {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>
                {post.user._id === currentUser?._id && (
                    <button onClick={handleDeletePost} className='text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full cursor-pointer transition-colors' title='Delete post'>
                        <Trash2 className='w-4 h-4' />
                    </button>
                )}
            </div>
            {
                post.content && <div className='text-gray-800 text-xs sm:text-sm whitespace-pre-line'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            }

            {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
                <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : post.image_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {post.image_urls.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt=""
                            className={`w-full h-auto max-h-125 object-contain rounded-lg bg-gray-100`}
                        />
                    ))}
                </div>
            )}
            <div className='flex items-center gap-3 sm:gap-4 to-gray-600 text-xs sm:text-sm border-gray-300'>
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleLike}>
                    <Heart className={`w-4 h-4
                    ${Array.isArray(likes) && likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`} />
                    <span>{likes.length}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleFetchComments}>
                    <MessageCircle className='w-4 h-4' />
                    <span>{commentCount}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleRepost}>
                    <Repeat2 className='w-4 h-4' />
                    <span>{repostCount}</span>
                </div>
            </div>

            <div className='space-y-3 pt-3 border-t border-gray-200'>
                <div className='flex justify-between items-center'>
                    <h3 className='font-semibold text-xs sm:text-sm'>Comments</h3>
                    {commentCount > 3 && !showAllComments && (
                        <button onClick={handleFetchComments} className='text-indigo-500 hover:text-indigo-700 text-xs sm:text-sm'>
                            View all {commentCount} comments
                        </button>
                    )}
                    {showAllComments && (
                        <button onClick={handleFetchComments} className='text-gray-500 hover:text-gray-700 text-xs sm:text-sm'>
                            Show less
                        </button>
                    )}
                </div>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        className='flex-1 outline-none text-xs sm:text-sm border border-gray-300 rounded-full px-3 sm:px-4 py-2'
                        placeholder='Add a comment...'
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                        onClick={handleAddComment}
                        className='bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-indigo-600'
                    >
                        Post
                    </button>
                </div>
                <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
                        <div key={comment._id} className='flex gap-2 items-start'>
                            <img src={comment.user.profile_picture} alt='' className='w-6 h-6 sm:w-8 sm:h-8 rounded-full' />
                            <div className='flex-1'>
                                <div className='flex items-center gap-2 justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span className='font-semibold text-xs sm:text-sm'>{comment.user.full_name}</span>
                                        <span className='text-gray-500 text-[10px] sm:text-xs'>{moment(comment.createdAt).fromNow()}</span>
                                    </div>
                                    {comment.user._id === currentUser?._id && (
                                        <button onClick={() => handleDeleteComment(comment._id)} className='text-red-500 hover:text-red-700 cursor-pointer'>
                                            <Trash2 className='w-3 h-3 sm:w-4 sm:h-4' />
                                        </button>
                                    )}
                                </div>
                                <p className='text-xs sm:text-sm text-gray-800'>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}

export default PostCard
