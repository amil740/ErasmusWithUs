import * as SecureStore from 'expo-secure-store'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, getMe } from '../lib/api'
import type { User } from '../lib/types'

const TOKEN_KEY = 'erasmuswithus.session-token'

type AuthValue = {
  user: User | null
  token: string | null
  booting: boolean
  acceptSession: (token: string, user: User) => Promise<void>
  updateUser: (user: User) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let active = true
    void SecureStore.getItemAsync(TOKEN_KEY)
      .then(async (savedToken) => {
        if (!savedToken) return
        try {
          const currentUser = await getMe(savedToken)
          if (active) {
            setToken(savedToken)
            setUser(currentUser)
          }
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            await SecureStore.deleteItemAsync(TOKEN_KEY)
          }
        }
      })
      .finally(() => { if (active) setBooting(false) })
    return () => { active = false }
  }, [])

  const acceptSession = useCallback(async (nextToken: string, nextUser: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const updateUser = useCallback((nextUser: User) => setUser(nextUser), [])

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, token, booting, acceptSession, updateUser, signOut }), [user, token, booting, acceptSession, updateUser, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
