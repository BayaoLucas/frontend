import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  requisicao,
  salvarSessao,
  type UsuarioLogado
} from '../services/api';

interface RespostaLogin {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
}

export function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function lidarComSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro(null);
    setCarregando(true);

    try {
      const dados = await requisicao<RespostaLogin>(
        '/usuarios/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            senha
          })
        }
      );

      salvarSessao(dados.token, dados.usuario);
      navigate('/dashboard', { replace: true });
    } catch (erroLogin) {
      setErro(
        erroLogin instanceof Error
          ? erroLogin.message
          : 'Não foi possível realizar o login.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={lidarComSubmit}
      className="aurora-glass-card w-full rounded-2xl p-7 sm:p-9 shadow-2xl"
    >
      <h3 className="mb-6 text-center text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
        Acesso ao sistema
      </h3>

      {erro && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-sm font-medium text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
        >
          {erro}
        </div>
      )}

      <div className="mb-5">
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-300/90"
        >
          E-mail
        </label>

        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className="aurora-input w-full rounded-xl p-3.5 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="gerente@ms2.com"
          required
          disabled={carregando}
        />
      </div>

      <div className="mb-7">
        <label
          htmlFor="senha"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-purple-300/90"
        >
          Senha
        </label>

        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          className="aurora-input w-full rounded-xl p-3.5 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Digite sua senha"
          required
          disabled={carregando}
        />
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="aurora-btn w-full rounded-xl py-3.5 font-bold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? 'Entrando no sistema...' : 'Entrar no Aurora'}
      </button>
    </form>
  );
}

