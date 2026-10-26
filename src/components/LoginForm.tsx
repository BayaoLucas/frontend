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
      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-2xl"
    >
      <h2 className="mb-6 text-center text-2xl font-bold text-white">
        Acesso ao sistema
      </h2>

      {erro && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {erro}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-slate-300"
        >
          E-mail
        </label>

        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className="w-full rounded border border-slate-600 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
          placeholder="gerente@ms2.com"
          required
          disabled={carregando}
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="senha"
          className="mb-2 block text-sm font-bold text-slate-300"
        >
          Senha
        </label>

        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          className="w-full rounded border border-slate-600 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
          placeholder="Digite sua senha"
          required
          disabled={carregando}
        />
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded bg-cyan-600 px-4 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}