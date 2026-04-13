import React, { useState } from 'react'
import { Image, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import api from '../api/axios'

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = useSelector((state) => state.user.value)
  const { getToken } = useAuth()

  const handleSubmit = async () => {
    if (!images.length && !content.trim()) {
      return toast.error("Please add content first")
    }
    setLoading(true)
    const post_type = images.length && content ? "text_with_image" : images.length ? "image" : "text"
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append("content", content)
      formData.append("post_type", post_type)
      images.map((image) => (
        formData.append("images", image)
      ))
      const { data } = await api.post("/api/post/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        toast.success("Post created successfully")
        setContent("")
        setImages([])
        if (onPostCreated) onPostCreated()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-white rounded-xl shadow p-4 mb-4'>
      <div className='flex items-center gap-3'>
        <img src={user?.profile_picture} alt="" className='w-10 h-10 rounded-full' />
        <div className='flex-1'>
          <textarea 
            className='w-full resize-none max-h-20 text-sm outline-none placeholder-gray-400'
            placeholder="What's on your mind?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
            rows={2}
          />
        </div>
      </div>
      {images.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-3'>
          {images.map((image, i) => (
            <div key={i} className='relative group'>
              <img src={URL.createObjectURL(image)} alt="" className='h-16 rounded-md object-cover' />
              <button 
                onClick={() => setImages(images.filter((_, index) => index !== i))}
                className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'
              >
                <div className='bg-white rounded-full p-1'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
        <label htmlFor="post-images" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
          <Image className='w-5 h-5' />
          <span>Photo</span>
        </label>
        <input 
          type="file" 
          id='post-images' 
          name="images" 
          accept='image/*' 
          hidden 
          multiple
          onChange={(e) => setImages([...images, ...Array.from(e.target.files)])}
        />
        <button 
          onClick={() => toast.promise(handleSubmit(), {
            loading: "Posting...",
            success: "Post created successfully",
            error: "Failed to create post"
          })}
          disabled={loading}
          className='flex items-center gap-2 text-sm bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition text-white font-medium px-4 py-2 rounded-full cursor-pointer disabled:opacity-50'
        >
          <Send className='w-4 h-4' />
          Post
        </button>
      </div>
    </div>
  )
}

export default CreatePost
