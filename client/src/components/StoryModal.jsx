import React, { useState } from 'react'
import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import api from "../api/axios"

const StoryModal = ({ setShowModal, fetchStories }) => {
    const navigate = useNavigate()
    const bgColors = ["#4f46e3", "#7c3aed", "#db2777"]
    const [mode, setMode] = useState("text")
    const [background, setBackground] = useState(bgColors[0])
    const [media, setMedia] = useState(null)
    const [text, setText] = useState("")
    const [previewUrl, setPreviewUrl] = useState(null)
    const { getToken } = useAuth()
    const MAX_VIDEO_DURATION = 60
    const MAX_VIDEO_SIZE_MB = 50

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if (file.type.startsWith("video")) {
            if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                toast.error(`Video size should be less than ${MAX_VIDEO_SIZE_MB}MB`)
                setMedia(null)
                setPreviewUrl(null)
                return
            }
            const video = document.createElement('video')
            video.preload = "metadata"
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src)
                if (video.duration > MAX_VIDEO_DURATION) {
                    toast.error(`Video duration should be less than ${MAX_VIDEO_DURATION} seconds`)
                    setMedia(null)
                    setPreviewUrl(null)

                } else {
                    setMedia(file)
                    setPreviewUrl(URL.createObjectURL(file))
                    setMode("media")
                }
            }
            video.src = URL.createObjectURL(file)
        } else if (file.type.startsWith("image")) {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
            setText("")
            setMode("media")
        }

    }

    const handleCreateStory = async () => {
        const media_type = media?.type?.startsWith("image") ? "image" : media?.type?.startsWith("video") ? "video" : "text"
        if (media_type === "text" && !text) {
            throw new Error("Please enter text")
        }
        let formData = new FormData()
        formData.append("content", text)
        formData.append("media_type", media_type)
        formData.append("media", media)
        formData.append("background_color", background)
        try {
            const { data } = await api.post("/api/story/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${await getToken()}`
                }
            })
            if (data.success) {
                toast.success("Story created successfully")
                setShowModal(false)
                fetchStories()
                navigate("/")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
            <div className='w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl p-4 flex flex-col gap-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='p-2 rounded-full hover:bg-zinc-800'>
                        <ArrowLeft className='text-white' />
                    </button>
                    <h2 className='text-lg font-semibold text-white'>Create Story</h2>
                    <div className='w-8'></div>
                </div>

                {/* Story Preview */}
                <div className='rounded-xl h-80 flex items-center justify-center relative overflow-hidden' style={{ backgroundColor: background }}>
                    {mode === "text" && (
                        <textarea
                            className='bg-transparent text-white w-full h-full p-4 text-lg resize-none focus:outline-none'
                            placeholder="What's on your mind?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    )}
                    {mode === "media" && previewUrl && (
                        media?.type.startsWith("image") ? (
                            <img src={previewUrl} alt="preview" className='object-contain max-h-full' />
                        ) : (
                            <video src={previewUrl} className='object-contain max-h-full' controls />
                        )
                    )}
                </div>

                {/* Background Selector */}
                <div className='flex gap-2'>
                    {bgColors.map(color => (
                        <button
                            key={color}
                            className={`w-6 h-6 rounded-full ring-2 ring-white cursor-pointer ${background === color ? "ring-4" : ""}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setBackground(color)}
                        />
                    ))}
                </div>

                {/* Mode Buttons */}
                <div className='flex gap-2'>
                    <button
                        onClick={() => { setMode("text"); setMedia(null); setPreviewUrl(null) }}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${mode === "text" ? "bg-white text-black" : "bg-zinc-800"}`}
                    >
                        <TextIcon size={18} /> Text
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === "media" ? "bg-white text-black" : "bg-zinc-800"}`}>
                        <input type="file" accept='image/*,video/*' className='hidden' onChange={handleMediaUpload} />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>

                {/* Create Button */}
                <button
                    onClick={() => toast.promise(handleCreateStory(), {
                        loading: "Saving...",
                        success: "Story created!",
                        error: "Failed to create story"
                    })}
                    className='flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 active:scale-95 transition-transform'
                >
                    <Sparkle size={18} /> Create Story
                </button>
            </div>
        </div>
    )
}

export default StoryModal