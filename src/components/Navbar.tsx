import React from 'react'
import type { Role, StudentStats } from '../types/trilha'
import { Flame, Gem, Heart, Zap, Volume2, VolumeX, GraduationCap, School, Brain } from 'lucide-react'

interface NavbarProps {
  role: Role
  setRole: (role: Role) => void
  stats: StudentStats
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void
  trailTitle: string
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  setRole,
  stats,
  soundEnabled,
  setSoundEnabled,
  trailTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Trail Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-purple-500/25 shrink-0 border-b-2 border-purple-800">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Trilha<span className="text-purple-400">Lingo</span>
              </span>
              <span className="hidden md:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                IA 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{trailTitle}</p>
          </div>
        </div>

        {/* Gamification Stats (Visible for Discente) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {role === 'DISCENTE' && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black">
              {/* Streak */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400"
                title="Dias seguidos de ofensiva"
              >
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{stats.streak}</span>
              </div>

              {/* Cristais */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400"
                title="Cristais acumulados"
              >
                <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>{stats.gems}</span>
              </div>

              {/* XP */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300"
                title="Pontos de Experiência (XP)"
              >
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                <span>{stats.xp} <span className="text-[10px] text-purple-300 font-normal">XP</span></span>
              </div>

              {/* Hearts */}
              <div
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400"
                title="Vidas disponíveis"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
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

          {/* Role Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setRole('DISCENTE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'DISCENTE'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discente</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCENTE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'DOCENTE'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Docente</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
