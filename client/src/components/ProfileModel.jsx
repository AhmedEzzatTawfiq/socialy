import React, { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import { updateUser } from '../features/user/userSlice'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

const ProfileModel = ({ setShowEdit }) => {

    const dispatch = useDispatch()
    const { getToken } = useAuth()

    const user = useSelector(state => state.user.value)
    const [editForm, setEditForm] = useState({
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: null,
        cover_photo: null,
        full_name: user.full_name,
        delete_profile: false,
    })

    const handleDeleteProfilePhoto = () => {
        setEditForm({ ...editForm, profile_picture: null, delete_profile: true })
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        try {
            const userData = new FormData()
            const { username, bio, location, profile_picture, cover_photo, full_name, delete_profile } = editForm
            userData.append('username', username)
            userData.append('bio', bio)
            userData.append('location', location)
            if (delete_profile) {
                userData.append('delete_profile', 'true')
            } else if (profile_picture) {
                userData.append('profile', profile_picture)
            }
            cover_photo && userData.append('cover', cover_photo)
            userData.append('full_name', full_name)
            const token = await getToken()
            dispatch(updateUser({ userData, token }))
            setShowEdit(false)
        } catch (error) {
            toast.error(error.message)
        }
    }
    return (
        <div className='fixed top-0 left-0 right-0 scale-z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
                    <form className='space-y-4' onSubmit={e => toast.promise(handleSaveProfile(e), {
                        loading: 'Saving...',
                        success: 'Profile updated successfully',
                        error: 'Failed to update profile'
                    })}>
                        <div className='flex flex-col items-start gap-3'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Profile Picture
                            </label>
                            <div className='flex items-center gap-4'>
                                <div className='group/profile relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                                    {editForm.profile_picture ? (
                                        <img src={URL.createObjectURL(editForm.profile_picture)} alt="" className='w-full h-full object-cover rounded-full' />
                                    ) : user.profile_picture ? (
                                        <img src={user.profile_picture} alt="" className='w-full h-full object-cover rounded-full' />
                                    ) : (
                                        <User className='w-12 h-12 text-gray-400' />
                                    )}
                                    <label htmlFor="profile_picture" className='absolute inset-0 flex items-center justify-center bg-black/20 rounded-full cursor-pointer opacity-0 group-hover/profile:opacity-100 transition-opacity'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </label>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="profile_picture" className='text-indigo-600 hover:text-indigo-700 text-sm cursor-pointer font-medium'>
                                        Change Photo
                                    </label>
                                    <input type="file" accept='image/*' id='profile_picture' className='hidden'
                                        onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0], delete_profile: false })} />
                                    {user.profile_picture && (
                                        <button type="button" onClick={handleDeleteProfilePhoto} className='text-red-500 hover:text-red-600 text-sm cursor-pointer font-medium flex items-center gap-1'>
                                            <Trash2 className='w-4 h-4' /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-start gap-3'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Cover Photo
                            </label>
                            <div className='w-full'>
                                <div className='group/cover relative w-full h-32 rounded-lg bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center overflow-hidden'>
                                    {editForm.cover_photo ? (
                                        <img src={URL.createObjectURL(editForm.cover_photo)} alt="" className='w-full h-full object-cover' />
                                    ) : user.cover_photo ? (
                                        <img src={user.cover_photo} alt="" className='w-full h-full object-cover' />
                                    ) : (
                                        <Pencil className='w-8 h-8 text-gray-400' />
                                    )}
                                    <label htmlFor="cover_photo" className='absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-opacity'>
                                        <Pencil className='w-6 h-6 text-white' />
                                    </label>
                                </div>
                                <input type="file" accept='image/*' id='cover_photo' className='hidden'
                                    onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })} />
                            </div>
                        </div>


                        <div>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                                Name
                            </label>
                            <input type="text" className='w-full p-3 border-gray-200 rounded-lg'
                                placeholder='Enter your new name'
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                value={editForm.full_name} />
                        </div>


                        <div>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                                Username
                            </label>
                            <input type="text" className='w-full p-3 border-gray-200 rounded-lg'
                                placeholder='Enter your new username'
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                value={editForm.username} />
                        </div>


                        <div>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                                Bio
                            </label>
                            <textarea rows={3} className='w-full p-3 border-gray-200 rounded-lg'
                                placeholder='Enter your new bio'
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                value={editForm.bio} />
                        </div>


                        <div className=''>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                                Location
                            </label>
                            <input type="text" className='w-full p-3 border-gray-200 rounded-lg'
                                placeholder='Enter your new location'
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                value={editForm.location} />
                        </div>

                        <div className='flex gap-3 mt-6'>
                            <button
                                type='button'
                                onClick={() => setShowEdit(false)}
                                className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer'
                                onClick={handleSaveProfile}
                            >
                                Save Changes
                            </button>
                        </div>



                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModel
