import React from 'react'
import { BadgeCheck, Heart, MessageCircle, Repeat2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { usePostCard } from '../hooks/usePostCard'
import PostComments from './PostComments'

const PostCard = ({ post, onDelete }) => {
    const navigate = useNavigate()
    const {
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
    } = usePostCard(post, onDelete)

    return (
        <div className='bg-white rounded-2xl shadow-xs border border-slate-100 p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 w-full max-w-2xl sm:max-w-2xl md:max-w-3xl mx-auto'>
            {/* Post Header */}
            <div className='flex justify-between items-start'>
                <div onClick={() => navigate(`/profile/${post.user._id}`)} className='inline-flex items-center gap-3 cursor-pointer group'>
                    <img src={post.user.profile_picture} className='w-10 h-10 rounded-full object-cover shadow-xs border border-slate-100' alt={post.user.full_name} />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span className='text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>
                                {post.user.full_name}
                            </span>
                            <BadgeCheck className='w-4 h-4 text-blue-500 shrink-0' />
                        </div>
                        <div className='text-slate-500 text-xs sm:text-sm font-medium'>
                            @{post.user.username} • {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>
                {post.user._id === currentUser?._id && (
                    <button onClick={handleDeletePost} className='text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full cursor-pointer transition-colors' title='Delete post'>
                        <Trash2 className='w-4 h-4' />
                    </button>
                )}
            </div>

            {/* Post Content */}
            {post.content && (
                <div
                    className='text-slate-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            )}

            {/* Post Images */}
            {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
                <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.image_urls.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt=""
                            className='w-full h-auto max-h-125 object-contain rounded-xl bg-slate-50 border border-slate-100'
                        />
                    ))}
                </div>
            )}

            {/* Post Action Buttons */}
            <div className='flex items-center gap-5 sm:gap-6 text-xs sm:text-sm text-slate-600 pt-1'>
                <button
                    className='flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer active:scale-95'
                    onClick={handleLike}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
                    <span className={`font-semibold ${isLiked ? "text-red-500" : ""}`}>{likes.length}</span>
                </button>

                <button
                    className='flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer active:scale-95'
                    onClick={handleFetchComments}
                >
                    <MessageCircle className='w-4 h-4' />
                    <span className='font-semibold'>{commentCount}</span>
                </button>

                <button
                    className='flex items-center gap-1.5 hover:text-green-600 transition-colors cursor-pointer active:scale-95'
                    onClick={handleRepost}
                >
                    <Repeat2 className='w-4 h-4' />
                    <span className='font-semibold'>{repostCount}</span>
                </button>
            </div>

            {/* Comments Section */}
            <PostComments
                commentCount={commentCount}
                comments={comments}
                commentText={commentText}
                setCommentText={setCommentText}
                showAllComments={showAllComments}
                handleFetchComments={handleFetchComments}
                handleAddComment={handleAddComment}
                handleDeleteComment={handleDeleteComment}
                currentUser={currentUser}
            />
        </div>
    )
}

export default PostCard
