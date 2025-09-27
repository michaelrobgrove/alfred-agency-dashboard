import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        onLogin(session)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        onLogin(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [onLogin])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      alert('Error logging in: ' + error.message)
    }
    setLoading(false)
  }

  if (session) {
    return null // User is logged in, don't show login form
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Alfred Web Design
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Agency Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign in with GitHub'}
          </button>
        </div>
      </div>
    </div>
  )
}
