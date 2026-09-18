import React, { useState } from 'react'
import type { Module } from '../types/trilha'
import {
  X,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  Clock,
  Zap,
} from 'lucide-react'
import { playSound } from '../utils/audio'
import confetti from 'canvas-confetti'

interface ModuleStudyModalProps {
  module: Module
  onClose: () => void
  onCompleteModule: (moduleId: number, score: number) => void
  soundEnabled: boolean
}

type ModalTab = 'STUDY' | 'QUIZ' | 'RESULT'

export const ModuleStudyModal: React.FC<ModuleStudyModalProps> = ({
  module,
  onClose,
  onCompleteModule,
  soundEnabled,
}) => {
  const [tab, setTab] = useState<ModalTab>('STUDY')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [scoreCount, setScoreCount] = useState(0)

  const totalQuestions = module.quizQuestions.length
  const currentQuestion = module.quizQuestions[currentQuestionIndex]

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return

    setIsAnswerChecked(true)
    const isCorrect = selectedOption === currentQuestion.correctAnswer
    if (isCorrect) {
      playSound('correct', soundEnabled)
      setScoreCount((prev) => prev + 1)
    } else {
      playSound('wrong', soundEnabled)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerChecked(false)
    } else {
      // Quiz finished, show results
      const finalScore = scoreCount + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)
      const percent = Math.round((finalScore / totalQuestions) * 100)
      setTab('RESULT')

      if (percent >= 70) {
        playSound('fanfare', soundEnabled)
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          })
        } catch {
          // ignore if canvas-confetti fails
        }
        onCompleteModule(module.id, percent)
      }
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerChecked(false)
    setScoreCount(0)
    setTab('QUIZ')
  }

  const finalPercent = totalQuestions > 0 ? Math.round((scoreCount / totalQuestions) * 100) : 0
  const isApproved = finalPercent >= 70

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
              #{module.order}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
                {module.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {module.duration}
                </span>
                <span>•</span>
                <span>{module.unitTitle}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Estudo vs Atividade) */}
        {tab !== 'RESULT' && (
          <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2">
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled)
                setTab('STUDY')
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'STUDY'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              1. Conteúdo de Estudo
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled)
                setTab('QUIZ')
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'QUIZ'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              2. Atividade / Quiz de Fixação
              <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[11px]">
                {module.quizQuestions.length} questões
              </span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: CONTEÚDO DE ESTUDO */}
          {tab === 'STUDY' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Resumo Introdução */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Roteiro de Aprendizagem Preparado pelo Docente
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {module.studySummary}
                </p>
              </div>

              {/* Tópicos Didáticos */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Tópicos Essenciais para Dominar
                </h3>

                {module.studyTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                  >
                    <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-purple-600/20 text-purple-300 text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      {topic.title}
                    </h4>

                    <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed pl-7">
                      {topic.content}
                    </div>

                    {topic.codeSnippet && (
                      <div className="ml-7 rounded-xl bg-slate-900 p-3 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
                        <pre>{topic.codeSnippet}</pre>
                      </div>
                    )}

                    {topic.keyTakeaway && (
                      <div className="ml-7 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">💡 Dica Chave:</span>
                        <span>{topic.keyTakeaway}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recursos Complementares */}
              {module.resources && module.resources.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Materiais de Apoio & Links Recomendados
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {module.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-xs text-slate-300 flex items-center justify-between gap-2 transition-all group"
                      >
                        <span className="font-medium group-hover:text-purple-300 truncate">
                          {res.label}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action to Start Quiz */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled)
                    setTab('QUIZ')
                  }}
                  className="duo-btn-purple px-6 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50"
                >
                  <span>Estudei o Conteúdo! Fazer Atividade</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ATIVIDADE / QUIZ INTERATIVO */}
          {tab === 'QUIZ' && currentQuestion && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Quiz Progress Bar in Purple */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
                  <span className="text-purple-300">{scoreCount} acertos até agora</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 mb-1.5 block">
                  Pergunta com Correção Instantânea
                </span>
                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Alternatives */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrectAnswer = idx === currentQuestion.correctAnswer

                  let optionClasses =
                    'bg-slate-950/50 border-slate-800 text-slate-200 hover:bg-slate-800/40 hover:border-slate-700'

                  if (isAnswerChecked) {
                    if (isCorrectAnswer) {
                      optionClasses = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50'
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClasses = 'bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-500/50'
                    } else {
                      optionClasses = 'bg-slate-950/30 border-slate-800 text-slate-500'
                    }
                  } else if (isSelected) {
                    optionClasses = 'bg-purple-950/70 border-purple-500 text-purple-200 ring-2 ring-purple-500'
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => {
                        playSound('click', soundEnabled)
                        setSelectedOption(idx)
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${optionClasses}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-800/90 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Feedback Sheet when Answer Checked */}
              {isAnswerChecked && (
                <div
                  className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-bottom-2 ${
                    selectedOption === currentQuestion.correctAnswer
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {selectedOption === currentQuestion.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Excelente! Resposta correta! +10 XP</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span>Ops! Não foi dessa vez.</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                    <span className="font-bold text-slate-100">Explicação Pedagógica: </span>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTab('STUDY')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Rever Material Teórico
                </button>

                {!isAnswerChecked ? (
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleCheckAnswer}
                    className="duo-btn-purple px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Verificar Resposta
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="duo-btn-blue px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentQuestionIndex + 1 < totalQuestions ? 'Próxima Questão' : 'Ver Resultado'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TELA DE RESULTADO / CONCLUSÃO E DESBLOQUEIO */}
          {tab === 'RESULT' && (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="relative inline-block">
                <div
                  className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-2xl ${
                    isApproved
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 border-4 border-purple-300 text-white shadow-purple-500/40'
                      : 'bg-slate-800 border-4 border-slate-700 text-slate-400'
                  }`}
                >
                  {isApproved ? '🧠' : '📚'}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {isApproved ? 'Módulo Concluído com Sucesso!' : 'Quase lá! Tente Novamente'}
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  {isApproved
                    ? `Você atingiu ${finalPercent}% de acerto e demonstrou domínio sobre os conceitos estudados!`
                    : `Você obteve ${finalPercent}%. O critério mínimo da plataforma é 70% de acerto para liberar o próximo módulo.`}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="max-w-md mx-auto grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Acertos</span>
                  <p className="text-lg font-black text-purple-300 mt-0.5">
                    {scoreCount}/{totalQuestions}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Aproveitamento</span>
                  <p
                    className={`text-lg font-black mt-0.5 ${
                      isApproved ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {finalPercent}%
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Recompensa</span>
                  <p className="text-lg font-black text-purple-400 mt-0.5 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 fill-purple-400" />
                    +{isApproved ? 50 : 10} XP
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {isApproved ? (
                <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>🔓 Parabéns! O próximo módulo foi liberado na sua trilha!</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium max-w-md mx-auto">
                  Revise o material teórico nas abas anteriores antes de refazer o quiz.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {!isApproved ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setTab('STUDY')}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Revisar Conteúdo
                    </button>
                    <button
                      type="button"
                      onClick={handleRestartQuiz}
                      className="duo-btn-purple px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refazer Quiz
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="duo-btn-purple px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60"
                  >
                    <Trophy className="w-4 h-4" />
                    Continuar na Trilha
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
