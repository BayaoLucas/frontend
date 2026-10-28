import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adicionarAoCarrinho,
  formatarMoeda,
  obterCarrinhoSalvo,
  obterUsuarioSalvo,
  requisicao,
  type Produto
} from '../services/api';

export function Catalogo() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [notificacao, setNotificacao] = useState<{ texto: string; sucesso: boolean } | null>(null);
  const [totalItensCarrinho, setTotalItensCarrinho] = useState(0);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';

  const atualizarContador = useCallback(() => {
    const itens = obterCarrinhoSalvo();
    setTotalItensCarrinho(itens.reduce((acc, cur) => acc + cur.quantidade, 0));
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = gerente
        ? await requisicao<Produto[]>('/produtos?incluir_inativos=true')
        : await requisicao<Produto[]>('/produtos/catalogo');
      setProdutos(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar catálogo.');
    } finally {
      setCarregando(false);
    }
  }, [gerente]);

  useEffect(() => {
    void carregar();
    atualizarContador();
    window.addEventListener('carrinhoAtualizado', atualizarContador);
    return () => window.removeEventListener('carrinhoAtualizado', atualizarContador);
  }, [carregar, atualizarContador]);

  function dispararNotificacao(texto: string, sucesso: boolean) {
    setNotificacao({ texto, sucesso });
    window.setTimeout(() => {
      setNotificacao(null);
    }, 3500);
  }

  function handleAdicionarAoCarrinho(produto: Produto) {
    const res = adicionarAoCarrinho(produto, 1);
    dispararNotificacao(res.mensagem, res.sucesso);
  }

  function handleComprarDireto(produto: Produto) {
    const res = adicionarAoCarrinho(produto, 1);
    if (res.sucesso) {
      navigate('/vendas');
    } else {
      dispararNotificacao(res.mensagem, false);
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    if (!gerente && Number(p.ativo) === 0) return false;
    if (gerente && !mostrarInativos && Number(p.ativo) === 0) return false;
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
    <div className="space-y-8 relative">
      {/* Toast Notificação animada flutuante com estilo Aurora */}
      {notificacao && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`aurora-glass-card rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border flex items-center gap-3 ${
              notificacao.sucesso
                ? 'border-emerald-500/60 bg-emerald-950/80 text-emerald-200'
                : 'border-rose-500/60 bg-rose-950/80 text-rose-200'
            }`}
          >
            <span className="text-xl">{notificacao.sucesso ? '🛒' : '⚠️'}</span>
            <div className="text-sm">
              <p className="font-bold">{notificacao.sucesso ? 'Adicionado com sucesso!' : 'Atenção'}</p>
              <p className="text-xs text-slate-300">{notificacao.texto}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificacao(null)}
              className="text-slate-400 hover:text-slate-100 ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CATÁLOGO & VITRINE
          </div>
          <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
            Catálogo Aurora
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Adicione itens ao carrinho ou compre diretamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Atalho para o Carrinho / Vendas */}
          {totalItensCarrinho > 0 && (
            <button
              type="button"
              onClick={() => navigate('/vendas')}
              className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🛒 Ver Carrinho</span>
              <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                {totalItensCarrinho}
              </span>
            </button>
          )}

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

          {gerente && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-900/50 border border-slate-700/60 px-3 py-2.5 rounded-xl">
              <input
                type="checkbox"
                checked={mostrarInativos}
                onChange={e => setMostrarInativos(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700"
              />
              Mostrar inativos
            </label>
          )}
        </div>
      </section>

      {/* Alertas */}
      {erro && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {erro}
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

                  {/* Botões de Ação: Adicionar ao Carrinho + Comprar Direto */}
                  <div className="border-t border-slate-700/40 pt-3 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={semEstoque || inativo}
                      onClick={() => handleAdicionarAoCarrinho(produto)}
                      title="Adicionar ao carrinho e continuar navegando"
                      className="flex-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 py-2.5 px-2 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span>🛒</span>
                      <span>+ Carrinho</span>
                    </button>

                    <button
                      type="button"
                      disabled={semEstoque || inativo}
                      onClick={() => handleComprarDireto(produto)}
                      title="Ir direto para o pagamento desta peça"
                      className="aurora-btn flex-1 rounded-xl py-2.5 px-2 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>⚡</span>
                      <span>Comprar</span>
                    </button>
                  </div>
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
