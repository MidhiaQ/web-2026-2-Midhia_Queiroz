import React from 'react'
import { Server, Database, Sparkles, Globe, GitBranch, ShieldCheck } from 'lucide-react'

export const ArchitectureFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 pt-10 pb-16 mt-16 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
              Arquitetura em Nuvem & Infraestrutura do Sistema
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Projeto acadêmico conforme especificação técnica (Client-Server RESTful API + AWS + RBAC)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC: Docente & Discente
            </span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Globe className="w-4 h-4" />
              <span>Frontend SPA</span>
            </div>
            <p className="text-sm font-bold text-white">AWS Amplify / S3 + CloudFront</p>
            <span className="text-[11px] text-slate-400 block">
              React 19 + Vite + Tailwind CSS v4.x com CI/CD contínuo via GitHub.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Server className="w-4 h-4" />
              <span>Servidor Backend</span>
            </div>
            <p className="text-sm font-bold text-white">AWS EC2 (RESTful API)</p>
            <span className="text-[11px] text-slate-400 block">
              Node.js / Python com autenticação segura JWT e regras RBAC.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Database className="w-4 h-4" />
              <span>Banco Relacional</span>
            </div>
            <p className="text-sm font-bold text-white">AWS RDS PostgreSQL</p>
            <span className="text-[11px] text-slate-400 block">
              Tabelas para usuários, trilhas, módulos, gabaritos JSON e progresso dos alunos.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Inteligência Artificial</span>
            </div>
            <p className="text-sm font-bold text-white">Google Gemini API (LLM)</p>
            <span className="text-[11px] text-slate-400 block">
              Geração de roteiros por conteúdo e quizzes de fixação em JSON estrito.
            </span>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-800/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistema de Trilhas de Estudo com Quiz Gerado por IA • 2026</span>
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span>Repositório: </span>
            <a
              href="https://github.com/MidhiaQ/web-2026-2-Midhia_Queiroz.git"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline font-medium"
            >
              MidhiaQ/web-2026-2-Midhia_Queiroz
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
