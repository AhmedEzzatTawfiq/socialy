import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets, dummyUserData } from '../assets/assets'
import { CirclePlus, LogOut } from 'lucide-react'
import MenuItems from './MenuItems'
import { useClerk, UserButton } from '@clerk/react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate()
    const user = dummyUserData
    const { signOut } = useClerk()

    return (
        <div className={`bg-white shadow-lg flex flex-col justify-between transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            fixed top-0 left-0 h-full w-60 z-40 sm:relative sm:translate-x-0`}>

            {/* Logo */}
            <div className='flex flex-col w-full'>
                <img
                    src={assets.logo}
                    alt="Logo"
                    className='w-24 ml-6 my-4 cursor-pointer'
                    onClick={() => navigate("/")}
                />
                <hr className='border-gray-300' />

                {/* Menu Items */}
                <div className='flex flex-col mt-4 gap-2 px-4'>
                    <MenuItems setSidebarOpen={setSidebarOpen} />

                    <Link
                        to="/createpost"
                        className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-100 transition cursor-pointer text-gray-800 font-medium'
                    >
                        <CirclePlus className='w-5 h-5' />
                        Create Post
                    </Link>
                </div>
            </div>
            <UserButton />
            <LogOut
                onClick={() => signOut({ redirectUrl: "/" })}
                className='w-4 text-gray-400 hover:text-gray-700 transition cursor-pointer'
            />
        </div>
    )
}

export default Sidebar