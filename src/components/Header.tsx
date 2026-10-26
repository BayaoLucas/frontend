import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  limparSessao,
  obterUsuarioSalvo,
  requisicao
} from '../services/api';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [saindo, setSaindo] = useState(false);

  const usuario = obterUsuarioSalvo();
  const estaNoLogin = location.pathname === '/';

  async function sair() {
    setSaindo(true);

    try {
      if (localStorage.getItem('ms2_token')) {
        await requisicao<{ mensagem: string }>('/usuarios/logout', {
          method: 'POST'
        });
      }
    } catch {
      // A sessao local tambem precisa ser encerrada se o servidor falhar.
    } finally {
      limparSessao();
      setSaindo(false);
      navigate('/', { replace: true });
    }
  }

  return (
    <header className="relative z-20 border-b border-emerald-500/20 bg-slate-950/45 backdrop-blur-xl shadow-lg shadow-black/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to={usuario ? '/dashboard' : '/'} className="group block">
          <h1 className="aurora-gradient-text text-2xl font-black tracking-tight transition-transform duration-300 group-hover:scale-105 sm:text-3xl">
            Aurora
          </h1>
          <p className="text-xs text-slate-400">
            Sistema de gerenciamento de vendas
          </p>
        </Link>

        {usuario && !estaNoLogin && (
          <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
            <Link
              to="/dashboard"
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                location.pathname === '/dashboard'
                  ? 'border border-emerald-500/35 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                  : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300'
              }`}
            >
              Painel
            </Link>

            <Link
              to="/produtos"
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                location.pathname === '/produtos'
                  ? 'border border-emerald-500/35 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                  : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300'
              }`}
            >
              Produtos
            </Link>

            <Link
              to="/vendas"
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                location.pathname === '/vendas'
                  ? 'border border-emerald-500/35 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                  : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300'
              }`}
            >
              Vendas
            </Link>

            <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              {usuario.nome} ({usuario.perfil})
            </span>

            <button
              type="button"
              onClick={sair}
              disabled={saindo}
              className="rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-all hover:border-rose-500/50 hover:bg-rose-500/25 disabled:opacity-50"
            >
              {saindo ? 'Saindo...' : 'Sair'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

