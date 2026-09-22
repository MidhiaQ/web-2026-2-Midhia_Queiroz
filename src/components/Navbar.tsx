import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { StudentStats } from '../types/trilha'
import {
  Flame,
  Gem,
  Heart,
  Zap,
  Volume2,
  VolumeX,
  Brain,
  LogOut,
  Sparkles,
  MapPin,
} from 'lucide-react'

interface NavbarProps {
  stats: StudentStats
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void
  trailTitle: string
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  soundEnabled,
  setSoundEnabled,
  trailTitle,
}) => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Se não estiver autenticado (ex: na tela de login), exibe uma versão simplificada ou cabeçalho básico
  if (!isAuthenticated || !user) {
    return (
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-purple-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Trilha<span className="text-purple-400">Lingo</span>
            </span>
          </div>
          <NavLink
            to="/login"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors"
          >
            Entrar
          </NavLink>
        </div>
      </header>
    )
  }

  const isAluno = user.role === 'DISCENTE'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Contextual Nav Links */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <NavLink
            to={isAluno ? '/' : '/admin'}
            className="flex items-center gap-2.5 shrink-0 focus:outline-none"
            title="Página Inicial"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-purple-500/25 border-b-2 border-purple-800">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-white">
                Trilha<span className="text-purple-400">Lingo</span>
              </span>
              <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-xs">{trailTitle}</p>
            </div>
          </NavLink>

          {/* Menus de Navegação por Perfil */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {isAluno ? (
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Minha Trilha</span>
              </NavLink>
            ) : (
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Painel Docente & IA</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Section: Stats, Audio, User Badge and Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Gamification Stats (Exclusivo para Aluno / Discente) */}
          {isAluno && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-black">
              {/* Streak */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400"
                title="Dias seguidos de ofensiva"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{stats.streak}</span>
              </div>

              {/* Cristais */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400"
                title="Cristais acumulados"
              >
                <Gem className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>{stats.gems}</span>
              </div>

              {/* XP */}
              <div
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300"
                title="Pontos de Experiência (XP)"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                <span>{stats.xp} <span className="text-[10px] text-purple-300 font-normal">XP</span></span>
              </div>

              {/* Hearts */}
              <div
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400"
                title="Vidas disponíveis"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{stats.hearts}</span>
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
            title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              isAluno ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
              {isAluno ? '🎓' : '👨‍🏫'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="font-bold text-white block text-[11px] truncate max-w-[120px]">
                {user.name}
              </span>
              <span className={`text-[10px] font-semibold uppercase ${
                isAluno ? 'text-purple-400' : 'text-indigo-400'
              }`}>
                {isAluno ? 'Aluno' : 'Professor'}
              </span>
            </div>
          </div>

          {/* Botão de Sair (Logout) */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
            title="Encerrar sessão e sair"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
