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

  // A mudança de rota atualiza o componente e a sessão exibida.
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
      // A sessão local também precisa ser encerrada se o servidor falhar.
    } finally {
      limparSessao();
      setSaindo(false);
      navigate('/', { replace: true });
    }
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to={usuario ? '/dashboard' : '/'} className="block">
          <h1 className="text-xl font-extrabold text-cyan-400 sm:text-2xl">
            MS² Vestuário
          </h1>
          <p className="text-xs text-slate-400">
            Sistema de gerenciamento de vendas
          </p>
        </Link>

        {usuario && !estaNoLogin && (
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/dashboard"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Painel
            </Link>

            <Link
              to="/produtos"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Produtos
            </Link>

            <Link
              to="/vendas"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Vendas
            </Link>

            <span className="text-slate-400">
              {usuario.nome} ({usuario.perfil})
            </span>

            <button
              type="button"
              onClick={sair}
              disabled={saindo}
              className="rounded bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {saindo ? 'Saindo...' : 'Sair'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}