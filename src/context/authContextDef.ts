import { createContext } from 'react'
import type { User, Role } from '../types/trilha'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, role: Role, name?: string) => void
  loginWithGoogle: (credentialResponse: any) => void // Adicione esta linha
  logout: () => void
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, role: Role, name?: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
