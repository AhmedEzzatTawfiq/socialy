import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Notifications from './pages/Notifications'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'
import { useUser } from '@clerk/react'

const App = () => {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-50 to-white'>
        <div className='w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3'></div>
        <p className='text-indigo-700 font-bold text-2xl tracking-wide'>Socialy</p>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <Layout /> : <Login />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='notifications' element={<Notifications />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='createpost' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
