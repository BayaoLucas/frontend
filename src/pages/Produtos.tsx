import { useCallback, useEffect, useState, type FormEvent } from 'react';

import {
  formatarMoeda,
  obterUsuarioSalvo,
  requisicao,
  type Produto
} from '../services/api';

const formularioInicial = {
  nome: '',
  descricao: '',
  tamanho: '',
  cor: '',
  preco: '',
  estoque: '0'
};

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [proximoCodigo, setProximoCodigo] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';

  const carregarProximoCodigo = useCallback(async () => {
    if (!gerente) return;
    try {
      const resp = await requisicao<{ proximoCodigo: string }>('/produtos/proximo-codigo');
      setProximoCodigo(resp.proximoCodigo);
    } catch {
      // Ignora erro de previsão silenciosamente
    }
  }, [gerente]);

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const termo = pesquisa.trim();
      const caminho = termo
        ? `/produtos?termo=${encodeURIComponent(termo)}`
        : '/produtos';

      const dados = await requisicao<Produto[]>(caminho);
      setProdutos(dados);
    } catch (erroConsulta) {
      setErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : 'Não foi possível carregar os produtos.'
      );
    } finally {
      setCarregando(false);
    }
  }, [pesquisa]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void carregarProdutos();
    }, 250);

    return () => window.clearTimeout(temporizador);
  }, [carregarProdutos]);

  useEffect(() => {
    void carregarProximoCodigo();
  }, [carregarProximoCodigo]);

  async function cadastrarProduto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);

    try {
      const novoProduto = await requisicao<Produto>('/produtos', {
        method: 'POST',
        body: JSON.stringify({
          nome: formulario.nome.trim(),
          descricao: formulario.descricao.trim() || null,
          tamanho: formulario.tamanho.trim() || null,
          cor: formulario.cor.trim() || null,
          preco: formulario.preco.replace(',', '.'),
          estoque: Number(formulario.estoque)
        })
      });

      setFormulario(formularioInicial);
      setMensagem(`Produto "${novoProduto.nome}" cadastrado com sucesso com o código ${novoProduto.codigo}.`);
      await carregarProdutos();
      await carregarProximoCodigo();
    } catch (erroCadastro) {
      setErro(
        erroCadastro instanceof Error
          ? erroCadastro.message
          : 'Não foi possível cadastrar o produto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ESTOQUE & CATÁLOGO
        </div>
        <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
          Produtos
        </h2>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">
          Consulte o catálogo da Aurora e acompanhe os preços e o estoque.
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

      {gerente && (
        <section className="aurora-glass-card rounded-2xl p-6 sm:p-7">
          <h3 className="mb-5 text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Cadastrar novo produto
          </h3>

          <form onSubmit={cadastrarProduto} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="codigo" className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-300/90">
                <span>Código</span>
                <span className="text-[10px] lowercase text-emerald-400 font-normal">
                  (gerado automaticamente)
                </span>
              </label>
              <input
                id="codigo"
                value={proximoCodigo ? `Código: ${proximoCodigo}` : 'Gerado automaticamente'}
                disabled
                readOnly
                className="aurora-input w-full rounded-xl p-3 font-mono font-bold text-emerald-300 outline-none cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label htmlFor="nome" className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-300/90">
                Nome da peça
              </label>
              <input
                id="nome"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                maxLength={120}
                required
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="Ex: Camiseta Aurora Nórdica"
              />
            </div>

            <div>
              <label htmlFor="descricao" className="mb-1 block text-xs font-bold uppercase tracking-wider text-purple-300/90">
                Descrição
              </label>
              <input
                id="descricao"
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="Ex: Algodão orgânico 100%"
              />
            </div>

            <div>
              <label htmlFor="tamanho" className="mb-1 block text-xs font-bold uppercase tracking-wider text-purple-300/90">
                Tamanho
              </label>
              <input
                id="tamanho"
                value={formulario.tamanho}
                onChange={(e) => setFormulario({ ...formulario, tamanho: e.target.value })}
                maxLength={20}
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="Ex: P, M, G, GG"
              />
            </div>

            <div>
              <label htmlFor="cor" className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-300/90">
                Cor
              </label>
              <input
                id="cor"
                value={formulario.cor}
                onChange={(e) => setFormulario({ ...formulario, cor: e.target.value })}
                maxLength={40}
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="Ex: Verde Aurora, Roxo Boreal"
              />
            </div>

            <div>
              <label htmlFor="preco" className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-300/90">
                Preço (R$)
              </label>
              <input
                id="preco"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.preco}
                onChange={(e) => setFormulario({ ...formulario, preco: e.target.value })}
                required
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="estoque" className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-300/90">
                Quantidade em estoque
              </label>
              <input
                id="estoque"
                type="number"
                min="0"
                step="1"
                value={formulario.estoque}
                onChange={(e) => setFormulario({ ...formulario, estoque: e.target.value })}
                required
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={salvando}
                className="aurora-btn w-full rounded-xl p-3 font-bold disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : '✦ Cadastrar produto'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="aurora-glass-card rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            Catálogo disponível
          </h3>

          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por nome ou código..."
            className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none sm:max-w-sm"
          />
        </div>

        {carregando ? (
          <p className="text-slate-400">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className="text-slate-400">Nenhum produto encontrado no catálogo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-emerald-500/20 text-emerald-300/80">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Cor</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                </tr>
              </thead>

              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id} className="border-b border-slate-800/60 transition-colors hover:bg-emerald-500/5">
                    <td className="p-3 font-mono text-xs font-bold text-emerald-300">#{produto.codigo}</td>
                    <td className="p-3 font-medium text-slate-100">{produto.nome}</td>
                    <td className="p-3 text-slate-400">{produto.tamanho || '-'}</td>
                    <td className="p-3 text-slate-400">{produto.cor || '-'}</td>
                    <td className="p-3 font-semibold text-slate-200">{formatarMoeda(produto.preco)}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        produto.estoque === 0
                          ? 'border border-rose-500/30 bg-rose-500/15 text-rose-300'
                          : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {produto.estoque} un
                      </span>
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
