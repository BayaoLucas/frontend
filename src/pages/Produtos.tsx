import { useCallback, useEffect, useState, type FormEvent } from 'react';

import {
  formatarMoeda,
  obterUsuarioSalvo,
  requisicao,
  type Produto
} from '../services/api';

const formularioInicial = {
  codigo: '',
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
  const [pesquisa, setPesquisa] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';

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

  async function cadastrarProduto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);

    try {
      await requisicao<Produto>('/produtos', {
        method: 'POST',
        body: JSON.stringify({
          codigo: formulario.codigo.trim().toUpperCase(),
          nome: formulario.nome.trim(),
          descricao: formulario.descricao.trim() || null,
          tamanho: formulario.tamanho.trim() || null,
          cor: formulario.cor.trim() || null,
          preco: Number(formulario.preco),
          estoque: Number(formulario.estoque)
        })
      });

      setFormulario(formularioInicial);
      setMensagem('Produto cadastrado com sucesso.');
      await carregarProdutos();
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
        <h2 className="text-3xl font-bold">Produtos</h2>
        <p className="mt-2 text-slate-400">
          Consulte o catálogo e acompanhe os preços e o estoque.
        </p>
      </section>

      {erro && (
        <div role="alert" className="rounded-lg bg-red-500/10 p-4 text-red-300">
          {erro}
        </div>
      )}

      {mensagem && (
        <div role="status" className="rounded-lg bg-emerald-500/10 p-4 text-emerald-300">
          {mensagem}
        </div>
      )}

      {gerente && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 text-xl font-bold">Cadastrar produto</h3>

          <form onSubmit={cadastrarProduto} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="codigo" className="mb-1 block text-sm text-slate-300">
                Código
              </label>
              <input
                id="codigo"
                value={formulario.codigo}
                onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                maxLength={50}
                required
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="nome" className="mb-1 block text-sm text-slate-300">
                Nome da peça
              </label>
              <input
                id="nome"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                maxLength={120}
                required
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="descricao" className="mb-1 block text-sm text-slate-300">
                Descrição
              </label>
              <input
                id="descricao"
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="tamanho" className="mb-1 block text-sm text-slate-300">
                Tamanho
              </label>
              <input
                id="tamanho"
                value={formulario.tamanho}
                onChange={(e) => setFormulario({ ...formulario, tamanho: e.target.value })}
                maxLength={20}
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="cor" className="mb-1 block text-sm text-slate-300">
                Cor
              </label>
              <input
                id="cor"
                value={formulario.cor}
                onChange={(e) => setFormulario({ ...formulario, cor: e.target.value })}
                maxLength={40}
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="preco" className="mb-1 block text-sm text-slate-300">
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
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div>
              <label htmlFor="estoque" className="mb-1 block text-sm text-slate-300">
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
                className="w-full rounded border border-slate-700 bg-slate-950 p-3"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded bg-cyan-600 p-3 font-bold hover:bg-cyan-500 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Cadastrar produto'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Catálogo</h3>

          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por nome ou código"
            className="w-full rounded border border-slate-700 bg-slate-950 p-3 sm:max-w-sm"
          />
        </div>

        {carregando ? (
          <p className="text-slate-400">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className="text-slate-400">Nenhum produto encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
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
                  <tr key={produto.id} className="border-b border-slate-800">
                    <td className="p-3">{produto.codigo}</td>
                    <td className="p-3 font-medium">{produto.nome}</td>
                    <td className="p-3">{produto.tamanho || '-'}</td>
                    <td className="p-3">{produto.cor || '-'}</td>
                    <td className="p-3">{formatarMoeda(produto.preco)}</td>
                    <td className="p-3">
                      <span className={produto.estoque === 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {produto.estoque}
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