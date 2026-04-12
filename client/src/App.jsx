import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import StoriesBar from './components/StoriesBar'
import StoryModal from './components/StoryModal'
import { Toaster } from 'react-hot-toast'
import { useAuth, useUser } from '@clerk/react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionsSlice.js'
import { addMessage } from './features/messages/messagesSlice.js'


const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)


  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }

    }
    fetchData()
  }, [user, getToken, dispatch])


  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASE_URL + "/api/message/" + user.id)
      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (pathname.current === ("/messages/" + message.from_user_id)) {
          dispatch(addMessage(message))
        } else {

        }
      }
      return () => {
        eventSource.close()
      }
    }
  }, [user, dispatch])
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <Layout /> : <Login />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
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

