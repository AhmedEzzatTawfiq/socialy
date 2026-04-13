import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useUser } from '@clerk/react';
import Loading from '../components/Loading';
import Sidebar from '../components/Sidebar';
// import { useSelector } from 'react-redux';

const Layout = () => {
  const { user } = useUser()
  // const user = useSelector((state) => state.user.value)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleContentClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  return user ? (
    <div className='w-full flex h-screen'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className='flex-1 bg-slate-50' onClick={handleContentClick}>
        <Outlet />
      </div>
      {sidebarOpen ? <X className='absolute top-3 right-3 p-2 z-100 rounded-md shadow w-10 text-gray-600 sm:hidden cursor-pointer' onClick={() => setSidebarOpen(false)} />
        : <Menu className='absolute top-3 right-3 p-2 z-100 rounded-md shadow w-10 text-gray-600 sm:hidden cursor-pointer' onClick={() => setSidebarOpen(true)} />}
    </div>
  ) :
    (
      <Loading />
    )
}

export default Layout
