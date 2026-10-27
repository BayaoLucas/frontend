import { useCallback, useEffect, useState } from 'react';
import {
  formatarMoeda,
  obterUsuarioSalvo,
  requisicao,
  type Produto
} from '../services/api';

export function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      // Gerentes veem todos os produtos (incluindo ocultos do catálogo), caixas só veem o catálogo
      const lista = gerente
        ? await requisicao<Produto[]>('/produtos')
        : await requisicao<Produto[]>('/produtos/catalogo');
      setProdutos(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar catálogo.');
    } finally {
      setCarregando(false);
    }
  }, [gerente]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function toggleCatalogo(produto: Produto) {
    setProcessando(produto.id);
    setMensagem('');
    setErro('');
    try {
      const visivel = Number(produto.visivel_catalogo) === 1;
      await requisicao(`/produtos/${produto.id}/${visivel ? 'ocultar-catalogo' : 'exibir-catalogo'}`, {
        method: 'PATCH'
      });
      setMensagem(visivel ? `"${produto.nome}" ocultado do catálogo.` : `"${produto.nome}" exibido no catálogo.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar visibilidade.');
    } finally {
      setProcessando(null);
    }
  }

  async function inativar(produto: Produto) {
    if (!confirm(`Desativar "${produto.nome}" permanentemente? O produto ficará indisponível.`)) return;
    setProcessando(produto.id);
    setErro('');
    try {
      await requisicao(`/produtos/${produto.id}/inativar`, { method: 'PATCH' });
      setMensagem(`"${produto.nome}" desativado com sucesso.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao desativar produto.');
    } finally {
      setProcessando(null);
    }
  }

  async function reativar(produto: Produto) {
    setProcessando(produto.id);
    setErro('');
    try {
      await requisicao(`/produtos/${produto.id}/reativar`, { method: 'PATCH' });
      setMensagem(`"${produto.nome}" reativado com sucesso.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao reativar produto.');
    } finally {
      setProcessando(null);
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    const matchGenero = !filtroGenero || p.genero === filtroGenero;
    const termo = termoBusca.toLowerCase();
    const matchBusca = !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      (p.cor ?? '').toLowerCase().includes(termo) ||
      (p.descricao ?? '').toLowerCase().includes(termo);
    return matchGenero && matchBusca;
  });

  const tagGenero = (g?: string | null) => {
    if (g === 'FEMININO') return { label: '🌸 Feminino', cls: 'border-pink-500/40 bg-pink-500/15 text-pink-300' };
    if (g === 'MASCULINO') return { label: '👔 Masculino', cls: 'border-blue-500/40 bg-blue-500/15 text-blue-300' };
    return { label: '✨ Unissex', cls: 'border-purple-500/40 bg-purple-500/15 text-purple-300' };
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CATÁLOGO
          </div>
          <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
            Catálogo de Produtos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {gerente ? 'Gerencie a visibilidade dos produtos no catálogo.' : 'Explore nossa coleção Aurora.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar produto..."
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            className="aurora-input rounded-xl px-4 py-2.5 text-sm w-56"
          />

          {/* Filtro gênero */}
          <select
            value={filtroGenero}
            onChange={e => setFiltroGenero(e.target.value)}
            className="aurora-input rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="">Todos os gêneros</option>
            <option value="FEMININO">🌸 Feminino</option>
            <option value="MASCULINO">👔 Masculino</option>
            <option value="UNISSEX">✨ Unissex</option>
          </select>
        </div>
      </section>

      {/* Alertas */}
      {erro && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {erro}
        </div>
      )}
      {mensagem && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="aurora-glass-card rounded-2xl p-12 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="mt-3 text-sm">Carregando catálogo...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="aurora-glass-card rounded-2xl p-12 text-center text-slate-400">
          <p className="text-5xl mb-4">👗</p>
          <p className="text-lg font-semibold text-slate-300">Nenhum produto encontrado.</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtosFiltrados.map(produto => {
            const { label: genLabel, cls: genCls } = tagGenero(produto.genero);
            const estaOculto = Number(produto.visivel_catalogo) === 0;
            const inativo = Number(produto.ativo) === 0;
            const semEstoque = produto.estoque === 0;

            return (
              <article
                key={produto.id}
                className={`aurora-glass-card rounded-2xl overflow-hidden flex flex-col transition-all hover:scale-[1.02] ${estaOculto || inativo ? 'opacity-50 grayscale' : ''}`}
              >
                {/* Imagem */}
                <div className="relative h-52 bg-slate-900/60 flex items-center justify-center overflow-hidden">
                  {produto.imagem_url ? (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-full w-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = ''; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <span className="text-5xl">👗</span>
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}

                  {/* Badges de status no topo */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {inativo && (
                      <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-600">
                        INATIVO
                      </span>
                    )}
                    {!inativo && estaOculto && (
                      <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40">
                        OCULTO
                      </span>
                    )}
                    {!inativo && semEstoque && !estaOculto && (
                      <span className="rounded-full bg-rose-900/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40 animate-pulse">
                        ESGOTADO
                      </span>
                    )}
                  </div>

                  {/* Código */}
                  <span className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 border border-slate-700/50">
                    {produto.codigo}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  {/* Nome e gênero */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-100 leading-snug line-clamp-2">{produto.nome}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${genCls}`}>
                      {genLabel}
                    </span>
                  </div>

                  {/* Descrição */}
                  {produto.descricao && (
                    <p className="text-xs text-slate-400 line-clamp-2">{produto.descricao}</p>
                  )}

                  {/* Detalhes */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {produto.tamanho && (
                      <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-slate-300">
                        Tam: {produto.tamanho}
                      </span>
                    )}
                    {produto.cor && (
                      <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-slate-300">
                        {produto.cor}
                      </span>
                    )}
                  </div>

                  {/* Preço e estoque */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-700/40 pt-3">
                    <span className="aurora-gradient-text text-lg font-black">
                      {formatarMoeda(produto.preco)}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${semEstoque ? 'border-rose-500/40 bg-rose-500/15 text-rose-300' : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'}`}>
                      {semEstoque ? 'Esgotado' : `${produto.estoque} un.`}
                    </span>
                  </div>

                  {/* Ações de gerente */}
                  {gerente && (
                    <div className="flex flex-wrap gap-2 border-t border-slate-700/40 pt-3">
                      {!inativo ? (
                        <>
                          <button
                            type="button"
                            disabled={processando === produto.id}
                            onClick={() => toggleCatalogo(produto)}
                            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${estaOculto
                              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            }`}
                          >
                            {processando === produto.id ? '...' : estaOculto ? '👁 Exibir' : '🙈 Ocultar'}
                          </button>
                          <button
                            type="button"
                            disabled={processando === produto.id}
                            onClick={() => inativar(produto)}
                            className="flex-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                          >
                            {processando === produto.id ? '...' : '🗑 Desativar'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={processando === produto.id}
                          onClick={() => reativar(produto)}
                          className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {processando === produto.id ? '...' : '✅ Reativar'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Legenda de status para gerentes */}
      {gerente && (
        <p className="text-center text-xs text-slate-500">
          <span className="text-amber-400">OCULTO</span> = visível apenas para gerentes &nbsp;·&nbsp;
          <span className="text-rose-400">ESGOTADO</span> = estoque zerado &nbsp;·&nbsp;
          <span className="text-slate-500">INATIVO</span> = desativado permanentemente
        </p>
      )}
    </div>
  );
}

