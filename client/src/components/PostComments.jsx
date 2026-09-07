import React from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { Trash2 } from 'lucide-react'

const PostComments = ({
    commentCount,
    comments,
    commentText,
    setCommentText,
    showAllComments,
    handleFetchComments,
    handleAddComment,
    handleDeleteComment,
    currentUser
}) => {
    const navigate = useNavigate()

    return (
        <div className='space-y-3 pt-3 border-t border-gray-200'>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-xs sm:text-sm text-slate-800'>Comments</h3>
                {commentCount > 3 && !showAllComments && (
                    <button onClick={handleFetchComments} className='text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-medium cursor-pointer'>
                        View all {commentCount} comments
                    </button>
                )}
                {showAllComments && (
                    <button onClick={handleFetchComments} className='text-gray-500 hover:text-gray-700 text-xs sm:text-sm font-medium cursor-pointer'>
                        Show less
                    </button>
                )}
            </div>

            <div className='flex gap-2'>
                <input
                    type='text'
                    className='flex-1 outline-none text-xs sm:text-sm border border-gray-300 rounded-full px-3 sm:px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all'
                    placeholder='Add a comment...'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                    onClick={handleAddComment}
                    className='bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer'
                >
                    Post
                </button>
            </div>

            <div className='space-y-2.5 max-h-60 overflow-y-auto pr-1'>
                {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
                    <div key={comment._id} className='flex gap-2.5 items-start bg-slate-50/60 p-2 rounded-xl'>
                        <img
                            src={comment.user.profile_picture}
                            alt=''
                            className='w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity shrink-0'
                            onClick={() => navigate(`/profile/${comment.user._id}`)}
                        />
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 justify-between'>
                                <div className='flex items-center gap-2 min-w-0'>
                                    <span
                                        className='font-semibold text-xs sm:text-sm text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors truncate'
                                        onClick={() => navigate(`/profile/${comment.user._id}`)}
                                    >
                                        {comment.user.full_name}
                                    </span>
                                    <span className='text-gray-400 text-[10px] sm:text-xs shrink-0'>
                                        {moment(comment.createdAt).fromNow()}
                                    </span>
                                </div>
                                {comment.user._id === currentUser?._id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className='text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full cursor-pointer transition-colors shrink-0'
                                        title='Delete comment'
                                    >
                                        <Trash2 className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
                                    </button>
                                )}
                            </div>
                            <p className='text-xs sm:text-sm text-slate-700 mt-0.5 whitespace-pre-wrap break-words'>{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PostComments
