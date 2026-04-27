import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets, dummyUserData } from '../assets/assets'
import { CirclePlus, LogOut } from 'lucide-react'
import MenuItems from './MenuItems'
import { useClerk, UserButton } from '@clerk/react'
import { useSelector } from 'react-redux'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.value)
    const { signOut } = useClerk()

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            fixed top-0 left-0 h-full w-64 z-40 sm:relative sm:translate-x-0`}>

            {/* Logo */}
            <div className='flex flex-col w-full'>
                <div className='px-5 py-5'>
                    <h1
                        className='text-2xl font-bold bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent cursor-pointer'
                        onClick={() => navigate("/")}
                    >
                        Socialy
                    </h1>
                </div>

                {/* Menu Items */}
                <div className='flex flex-col mt-1 gap-1 px-3'>
                    <MenuItems setSidebarOpen={setSidebarOpen} />

                    <Link
                        to="/createpost"
                        className='flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 cursor-pointer text-gray-600 font-medium'
                    >
                        <CirclePlus className='w-5 h-5' />
                        Create Post
                    </Link>
                </div>
            </div>

            {/* User Section */}
            <div className='p-4 border-t border-gray-100'>
                <div className='flex items-center justify-between'>
                    <UserButton />
                    <button
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className='flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer text-sm font-medium'
                    >
                        <LogOut className='w-4 h-4' />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar