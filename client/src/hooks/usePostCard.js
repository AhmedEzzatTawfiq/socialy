import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const usePostCard = (post, onDelete) => {
    const { getToken } = useAuth()
    const currentUser = useSelector((state) => state.user.value)

    const [likes, setLikes] = useState(Array.isArray(post.likes_count) ? post.likes_count : [])
    const [showAllComments, setShowAllComments] = useState(false)
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [repostCount, setRepostCount] = useState(post.repost_count || 0)
    const [commentCount, setCommentCount] = useState(post.comments_count || 0)

    const isLiked = currentUser?._id ? likes.includes(currentUser._id) : false

    const handleLike = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/like', { postId: post._id }, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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

    return {
        likes,
        isLiked,
        handleLike,
        repostCount,
        handleRepost,
        commentCount,
        comments,
        commentText,
        setCommentText,
        showAllComments,
        handleFetchComments,
        handleAddComment,
        handleDeletePost,
        handleDeleteComment,
        postWithHashtags,
        currentUser
    }
}
