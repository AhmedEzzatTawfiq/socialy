import React from 'react'
import { NavLink } from 'react-router-dom'
import { menuItemsData } from '../assets/assets'
import { useSelector } from 'react-redux'

const MenuItems = ({ setSidebarOpen }) => {
    const unreadCount = useSelector((state) => state.notifications.unreadCount)

    return (
        <div className='text-gray-600'>
            {
                menuItemsData.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"} onClick={() =>
                        setSidebarOpen(false)
                    } className={({ isActive }) => `px-3.5 py-2 flex items-center justify-between rounded-xl cursor-pointer
                        ${isActive ? "bg-indigo-50 text-indigo-700 font-semibold" : "hover:bg-gray-50 font-medium"}`}>
                        <div className='flex items-center gap-3'>
                            <Icon className='w-5 h-5' />
                            <span>{label}</span>
                        </div>
                        {to === '/notifications' && unreadCount > 0 && (
                            <span className='bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-5 text-center shadow-xs animate-pulse'>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))
            }
        </div >
    )
}

export default MenuItems
