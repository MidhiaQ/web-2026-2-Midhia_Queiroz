import React from 'react'
import type { Module } from '../types/trilha'
import { Check, Lock, Star, Sparkles, BookOpen, Cloud, Zap, Database, Trophy, Brain } from 'lucide-react'
import { playSound } from '../utils/audio'

interface DuolingoPathProps {
  modules: Module[]
  onSelectModule: (module: Module) => void
  soundEnabled: boolean
}

// Icon mapping helper
function renderModuleIcon(iconName: string, completed: boolean, unlocked: boolean) {
  const iconProps = { className: 'w-8 h-8 text-white stroke-[2.5]' }

  if (!unlocked) {
    return <Lock className="w-7 h-7 text-slate-400 stroke-[2.2]" />
  }

  if (completed) {
    return <Check className="w-8 h-8 text-amber-900 stroke-[3.5]" />
  }

  switch (iconName) {
    case 'cloud':
      return <Cloud {...iconProps} />
    case 'zap':
      return <Zap {...iconProps} />
    case 'sparkles':
      return <Sparkles {...iconProps} />
    case 'database':
      return <Database {...iconProps} />
    default:
      return <BookOpen {...iconProps} />
  }
}

export const DuolingoPath: React.FC<DuolingoPathProps> = ({
  modules,
  onSelectModule,
  soundEnabled,
}) => {
  // Determine offsets to create serpentine zig-zag path
  const offsets = [0, 45, 65, 30, -30, -65, -45]

  // Find current active node (first unlocked module that is not yet completed)
  const activeModule = modules.find((m) => m.unlocked && !m.completed) || modules[modules.length - 1]

  const completedModulesCount = modules.filter((m) => m.completed).length
  const totalPercent = Math.round((completedModulesCount / modules.length) * 100)

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 flex flex-col items-center select-none">
      {/* Unit Header Card (Purple/Indigo Theme) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 p-5 text-white shadow-xl shadow-purple-950/50 border-b-4 border-purple-950 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-200">
              {activeModule?.unitTitle || 'Unidade Atual'}
            </span>
            <h2 className="text-xl font-extrabold mt-0.5">Trilha de Aprendizado Guiada</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-950/70 px-3 py-1.5 rounded-xl border border-purple-400/30 font-black text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{completedModulesCount}/{modules.length} Feitos</span>
          </div>
        </div>

        {/* Mini progress inside unit card */}
        <div className="w-full bg-purple-950/80 h-2.5 rounded-full mt-4 overflow-hidden border border-purple-500/30">
          <div
            className="h-full bg-gradient-to-r from-purple-400 via-violet-300 to-amber-300 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
      </div>

      {/* Path Nodes Container */}
      <div className="relative w-full flex flex-col items-center gap-7 pb-20">
        {modules.map((module, index) => {
          const isCompleted = module.completed
          const isUnlocked = module.unlocked
          const isActive = module.id === activeModule?.id
          const offsetPx = offsets[index % offsets.length]

          return (
            <div
              key={module.id}
              className="relative flex flex-col items-center transition-transform duration-300"
              style={{
                transform: `translateX(${offsetPx}px)`,
              }}
            >
              {/* Floating Start Badge for Active Node in Purple */}
              {isActive && (
                <div className="absolute -top-12 z-20 animate-float flex flex-col items-center">
                  <div className="bg-purple-600 text-white font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-lg border-b-2 border-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{isCompleted ? 'REVISAR' : 'COMEÇAR'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  {/* Little speech bubble arrow */}
                  <div className="w-2.5 h-2.5 bg-purple-600 rotate-45 -mt-1 rounded-sm border-r border-b border-purple-800" />
                </div>
              )}

              {/* Node Button */}
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    playSound('click', soundEnabled)
                    onSelectModule(module)
                  }
                }}
                className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isCompleted
                    ? 'duo-node-completed cursor-pointer hover:scale-105'
                    : isActive
                    ? 'duo-node-active animate-duo-pulse cursor-pointer hover:scale-105'
                    : isUnlocked
                    ? 'duo-node-active cursor-pointer hover:scale-105'
                    : 'duo-node-locked opacity-70 cursor-not-allowed'
                }`}
                title={
                  !isUnlocked
                    ? 'Bloqueado: Conclua o módulo anterior para liberar!'
                    : isCompleted
                    ? `${module.title} (Concluído - Clique para revisar)`
                    : `${module.title} (Liberado para estudo!)`
                }
              >
                {/* Visual Icon Inside Node */}
                <div className="transition-transform group-hover:scale-110">
                  {renderModuleIcon(module.icon, isCompleted, isUnlocked)}
                </div>

                {/* Stars / Crown Badge on Completed Nodes */}
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full border-2 border-amber-200 shadow-md flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 fill-amber-950" />
                  </div>
                )}
              </button>

              {/* Module Description Label Under Node */}
              <div className="mt-2 text-center max-w-[170px]">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Módulo {index + 1}
                </span>
                <span
                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isCompleted
                      ? 'text-amber-300'
                      : isActive
                      ? 'text-purple-300'
                      : isUnlocked
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {module.shortTitle || module.title}
                </span>

                {/* Status Pill */}
                <div className="mt-1 flex justify-center">
                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ✓ Concluído
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ⚡ Disponível
                    </span>
                  ) : !isUnlocked ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Bloqueado
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}

        {/* Mascot / Encouragement Banner at Path Bottom with Brain icon */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              {completedModulesCount === modules.length
                ? 'Parabéns! Você completou todos os módulos da trilha!'
                : `Complete a atividade do Módulo ${(activeModule?.order || 1)} para liberar o próximo nível!`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cada atividade exige no mínimo 70% de acerto para validação e desbloqueio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
