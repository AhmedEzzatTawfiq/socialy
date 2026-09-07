import React from 'react'
import { assets } from "../assets/assets"
import { Star } from 'lucide-react'
import { SignIn } from '@clerk/react'

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-linear-to-br from-indigo-50 to-white relative overflow-hidden'>

      {/* logo */}
      <img src={assets.bg} alt="" className='absolute top-0 left-0 -z-10 w-full h-full object-cover opacity-20' />

      {/* left Side */}
      <div className='flex-1 flex flex-col lg:pl-32 p-6 md:p-12 md:min-h-screen justify-start'>
        <h1 className='text-3xl font-bold bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent'>
          Socialy
        </h1>

        {/* Content Centered Vertically on Desktop, Compact on Mobile */}
        <div className='flex flex-col gap-4 md:gap-6 max-w-xl mt-6 mb-6 md:my-auto md:py-8'>
          <div className='flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-sm w-fit'>
            <img src={assets.group_users} alt="" className='h-8 md:h-10' />

            <div className='flex flex-col'>
              <div className='flex'>
                {Array(5).fill(0).map((_, k) => (
                  <Star key={k} className='size-4 fill-amber-400 text-transparent' />
                ))}
              </div>
              <p className='text-sm text-gray-600'>Used by 12k developers</p>
            </div>
          </div>

          <h1 className='text-4xl md:text-6xl font-bold leading-tight bg-linear-to-r from-indigo-900 to-indigo-600 bg-clip-text text-transparent'>
            More than just truly connect
          </h1>

          <p className='text-gray-600 text-lg'>
            Build, connect, and collaborate with developers around the world in one powerful platform.
          </p>

        </div>
      </div>

      {/* Right Side (Login) */}
      <div className='flex-1 flex items-center justify-center sm:p-10'>

        <div className='max-w-md bg-white/80 rounded-3xl p-6 md:p-8 border border-gray-200'>
          <SignIn />
        </div>

      </div>

    </div>
  )
}

export default Login
