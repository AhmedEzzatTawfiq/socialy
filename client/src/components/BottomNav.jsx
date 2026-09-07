import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Bell, Search, UserIcon } from 'lucide-react'
import { useSelector } from 'react-redux'

const BottomNav = () => {
    const unreadCount = useSelector((state) => state.notifications.unreadCount)

    const navItems = [
        { to: '/', label: 'Feed', Icon: Home },
        { to: '/discover', label: 'Discover', Icon: Search },
        { to: '/messages', label: 'Messages', Icon: MessageCircle },
        { to: '/notifications', label: 'Notifications', Icon: Bell, badge: unreadCount },
        { to: '/profile', label: 'Profile', Icon: UserIcon },
    ]

    return (
        <nav className='fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/80 flex items-center justify-around h-16 sm:hidden px-1 shadow-lg'>
            {navItems.map(({ to, label, Icon, badge }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer ${
                        isActive ? 'text-indigo-600 scale-105' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <div className='relative'>
                        <Icon className='w-6 h-6' />
                        {to === '/notifications' && badge > 0 && (
                            <span className='absolute -top-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none shadow-xs animate-pulse'>
                                {badge > 99 ? '99+' : badge}
                            </span>
                        )}
                    </div>
                    <span className='text-[11px] font-medium mt-1'>{label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav
