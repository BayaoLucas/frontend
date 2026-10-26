import { useEffect, useState, type FormEvent } from 'react';

import {
  obterUsuarioSalvo,
  requisicao
} from '../services/api';

interface UsuarioItem {
  id: number;
  nome: string;
  email: string;
  perfil: 'CAIXA' | 'GERENTE';
  ativo: number;
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<'CAIXA' | 'GERENTE'>('CAIXA');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const usuarioLogado = obterUsuarioSalvo();
  const eGerente = usuarioLogado?.perfil === 'GERENTE';

  async function carregarUsuarios() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await requisicao<UsuarioItem[]>('/usuarios');
      setUsuarios(lista);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (eGerente) {
      void carregarUsuarios();
    }
  }, [eGerente]);

  async function cadastrarUsuario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);

    try {
      await requisicao<{ mensagem: string }>('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          perfil
        })
      });

      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('CAIXA');
      setMensagem('Novo usuário criado com sucesso!');
      await carregarUsuarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar usuário.');
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(id: number, ativoAtual: number) {
    setErro('');
    setMensagem('');
    try {
      const rota = ativoAtual === 1 ? `/usuarios/${id}/inativar` : `/usuarios/${id}/reativar`;
      await requisicao(rota, { method: 'PATCH' });
      setMensagem(ativoAtual === 1 ? 'Usuário inativado.' : 'Usuário reativado.');
      await carregarUsuarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao alterar status.');
    }
  }

  if (!eGerente) {
    return (
      <div className="aurora-glass-card rounded-2xl p-8 text-center text-rose-300">
        <h2 className="text-2xl font-bold">Acesso Restrito</h2>
        <p className="mt-2 text-slate-400">Apenas gerentes têm permissão para acessar e gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          CONTROLE DE ACESSO
        </div>
        <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
          Gerenciamento de Usuários
        </h2>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">
          Cadastre novos operadores de caixa ou gerentes com permissões de acesso ao sistema Aurora.
        </p>
      </section>

      {erro && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          {erro}
        </div>
      )}

      {mensagem && (
        <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          {mensagem}
        </div>
      )}

      <section className="aurora-glass-card rounded-2xl p-6 sm:p-7">
        <h3 className="mb-5 text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Cadastrar Novo Usuário
        </h3>

        <form onSubmit={cadastrarUsuario} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="user-nome" className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-300/90">
              Nome Completo
            </label>
            <input
              id="user-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
              placeholder="Ex: Maria Silva"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-300/90">
              E-mail de Acesso
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
              placeholder="maria@aurora.com"
            />
          </div>

          <div>
            <label htmlFor="user-senha" className="mb-1 block text-xs font-bold uppercase tracking-wider text-purple-300/90">
              Senha Inicial (mínimo 8 caracteres)
            </label>
            <input
              id="user-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={8}
              className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
              placeholder="Digite a senha"
            />
          </div>

          <div>
            <label htmlFor="user-perfil" className="mb-1 block text-xs font-bold uppercase tracking-wider text-purple-300/90">
              Perfil de Acesso
            </label>
            <select
              id="user-perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as 'CAIXA' | 'GERENTE')}
              className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
            >
              <option value="CAIXA">Operador de Caixa (Vendas e Consulta)</option>
              <option value="GERENTE">Gerente (Acesso Total e Cadastros)</option>
            </select>
          </div>

          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="aurora-btn w-full rounded-xl p-3.5 font-bold disabled:opacity-50"
            >
              {salvando ? 'Cadastrando...' : '✦ Criar Novo Usuário'}
            </button>
          </div>
        </form>
      </section>

      <section className="aurora-glass-card rounded-2xl p-6 sm:p-7">
        <h3 className="mb-5 text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          Usuários Cadastrados
        </h3>

        {carregando ? (
          <p className="text-slate-400">Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-slate-400">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-purple-500/20 text-purple-300/80">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Perfil</th>
                  <th className="p-3">Situação</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/60 transition-colors hover:bg-purple-500/5">
                    <td className="p-3 font-mono text-xs text-slate-400">#{u.id}</td>
                    <td className="p-3 font-medium text-slate-100">{u.nome}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.perfil === 'GERENTE'
                          ? 'border border-purple-500/30 bg-purple-500/15 text-purple-300'
                          : 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                      }`}>
                        {u.perfil}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.ativo === 1
                          ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                          : 'border border-rose-500/30 bg-rose-500/15 text-rose-300'
                      }`}>
                        {u.ativo === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.id !== usuarioLogado?.id && (
                        <button
                          type="button"
                          onClick={() => alternarStatus(u.id, u.ativo)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            u.ativo === 1
                              ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.ativo === 1 ? 'Inativar' : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

