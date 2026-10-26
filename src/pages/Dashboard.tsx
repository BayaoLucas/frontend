import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  formatarMoeda,
  requisicao,
  type Produto
} from '../services/api';

interface Venda {
  id: number;
  total: string;
  subtotal: string;
  desconto_percentual: string;
  desconto_valor: string;
  forma_pagamento: string;
  status: 'CONCLUIDA' | 'CANCELADA';
  realizada_em: string;
}

interface ItemVendaDetalhe {
  id: number;
  venda_id: number;
  produto_id: number;
  codigo_produto: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: string;
  total_item: string;
}

interface VendaComItens extends Venda {
  itens?: ItemVendaDetalhe[];
  carregandoItens?: boolean;
}

export function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<VendaComItens[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados dos modais
  const [modalEstoqueAberto, setModalEstoqueAberto] = useState(false);
  const [modalFaturamentoAberto, setModalFaturamentoAberto] = useState(false);
  const [vendaExpandidaId, setVendaExpandidaId] = useState<number | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [listaProdutos, listaVendas] = await Promise.all([
          requisicao<Produto[]>('/produtos'),
          requisicao<Venda[]>('/vendas')
        ]);

        setProdutos(listaProdutos);
        setVendas(listaVendas);
      } catch (erroConsulta) {
        setErro(
          erroConsulta instanceof Error
            ? erroConsulta.message
            : 'Não foi possível carregar o painel.'
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  const vendasConcluidas = vendas.filter(
    (venda) => venda.status === 'CONCLUIDA'
  );

  const faturamento = vendasConcluidas.reduce(
    (soma, venda) => soma + Number(venda.total),
    0
  );

  const produtosSemEstoque = produtos.filter(
    (produto) => produto.estoque === 0
  );

  // Carrega itens da venda ao expandir na lista
  async function alternarItensVenda(vendaId: number) {
    if (vendaExpandidaId === vendaId) {
      setVendaExpandidaId(null);
      return;
    }

    setVendaExpandidaId(vendaId);

    const vendaExistente = vendas.find((v) => v.id === vendaId);
    if (vendaExistente && !vendaExistente.itens) {
      try {
        const itens = await requisicao<ItemVendaDetalhe[]>(`/vendas/${vendaId}/itens`);
        setVendas((atuais) =>
          atuais.map((v) => (v.id === vendaId ? { ...v, itens } : v))
        );
      } catch {
        // Ignora silenciosamente
      }
    }
  }

  // Ao abrir o modal de faturamento, já busca os itens das vendas para exibição imediata
  async function abrirModalFaturamento() {
    setModalFaturamentoAberto(true);

    const vendasSemItens = vendasConcluidas.filter((v) => !v.itens);
    if (vendasSemItens.length > 0) {
      for (const v of vendasSemItens) {
        try {
          const itens = await requisicao<ItemVendaDetalhe[]>(`/vendas/${v.id}/itens`);
          setVendas((atuais) =>
            atuais.map((item) => (item.id === v.id ? { ...item, itens } : item))
          );
        } catch {
          // Continua
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PAINEL GERAL
          </div>
          <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
            Painel de controle
          </h2>
          <p className="mt-1 text-sm text-slate-300 sm:text-base">
            Acompanhe os produtos e as vendas da Aurora.
          </p>
        </div>

        <Link
          to="/vendas"
          className="aurora-btn inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold tracking-wide"
        >
          <span>✦ Iniciar venda</span>
        </Link>
      </section>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="aurora-glass-card rounded-2xl p-8 text-center text-slate-300">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="mt-3 text-sm">Carregando informações da Aurora...</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Produtos ativos */}
          <article className="aurora-glass-card rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Produtos ativos
            </h3>
            <p className="aurora-gradient-text mt-3 break-words text-3xl font-black sm:text-4xl">
              {produtos.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Produtos retornados pelo catálogo
            </p>
          </article>

          {/* Card 2: Vendas concluídas */}
          <article className="aurora-glass-card rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Vendas concluídas
            </h3>
            <p className="aurora-gradient-text mt-3 break-words text-3xl font-black sm:text-4xl">
              {vendasConcluidas.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Vendas presentes na consulta atual
            </p>
          </article>

          {/* Card 3: Estoque zerado (Clicável) */}
          <button
            type="button"
            onClick={() => setModalEstoqueAberto(true)}
            className="aurora-glass-card rounded-2xl p-6 text-left transition-all hover:scale-[1.02] border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.1)] hover:shadow-[0_0_35px_rgba(244,63,94,0.25)] group cursor-pointer !flex !flex-col !justify-between !items-start"
          >
            <div className="w-full flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 group-hover:text-rose-200">
                Estoque zerado
              </h3>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30 whitespace-nowrap">
                Ver peças ↗
              </span>
            </div>

            <p className="mt-3 break-words text-3xl font-black text-rose-400 group-hover:text-rose-300 sm:text-4xl drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]">
              {produtosSemEstoque.length}
            </p>

            <p className="mt-2 text-xs text-slate-400 group-hover:text-slate-300">
              Clique para ver as peças em falta
            </p>
          </button>

          {/* Card 4: Faturamento listado (Clicável com Detalhes) */}
          <button
            type="button"
            onClick={abrirModalFaturamento}
            className="aurora-glass-card rounded-2xl p-6 text-left transition-all hover:scale-[1.02] border-purple-500/30 hover:border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.1)] hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] group cursor-pointer !flex !flex-col !justify-between !items-start"
          >
            <div className="w-full flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 group-hover:text-purple-200">
                Faturamento listado
              </h3>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30 whitespace-nowrap">
                Ver vendas ↗
              </span>
            </div>

            <p className="mt-3 break-words text-3xl font-black text-purple-300 group-hover:text-purple-200 sm:text-4xl drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              {formatarMoeda(faturamento)}
            </p>

            <p className="mt-2 text-xs text-slate-400 group-hover:text-slate-300">
              Clique para ver produtos vendidos e descontos
            </p>
          </button>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <Link
          to="/produtos"
          className="aurora-glass-card group rounded-2xl p-6 transition-all"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 transition-transform group-hover:scale-110">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
            Catálogo de produtos
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Consultar o estoque, filtrar tamanhos e cadastrar novas peças.
          </p>
        </Link>

        <Link
          to="/vendas"
          className="aurora-glass-card group rounded-2xl p-6 transition-all"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-300 transition-transform group-hover:scale-110">
            ⚡
          </div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
            Área de vendas
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Selecionar produtos, montar o carrinho e concluir uma venda.
          </p>
        </Link>
      </section>

      {/* MODAL DE PRODUTOS COM ESTOQUE ZERADO */}
      {modalEstoqueAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          onClick={() => setModalEstoqueAberto(false)}
        >
          <div
            className="aurora-glass-card w-full max-w-2xl rounded-2xl border border-rose-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-300 text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Produtos em Falta no Estoque
                  </h3>
                  <p className="text-xs text-rose-300 mt-0.5">
                    {produtosSemEstoque.length}{' '}
                    {produtosSemEstoque.length === 1 ? 'peça esgotada' : 'peças esgotadas'} que precisam de reposição
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEstoqueAberto(false)}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {produtosSemEstoque.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="text-3xl block mb-2">🎉</span>
                  Excelente! Todas as peças possuem unidades disponíveis no estoque.
                </div>
              ) : (
                produtosSemEstoque.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-rose-500/25 bg-slate-900/60 hover:bg-slate-900/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {produto.codigo}
                        </span>
                        <span className="font-bold text-slate-100 text-sm sm:text-base">
                          {produto.nome}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {produto.genero && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 border border-slate-700">
                            {produto.genero}
                          </span>
                        )}
                        <span>Tam: <strong className="text-slate-200">{produto.tamanho || '-'}</strong></span>
                        <span>Cor: <strong className="text-slate-200">{produto.cor || '-'}</strong></span>
                        <span>Preço: <strong className="text-emerald-300">{formatarMoeda(produto.preco)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-300 animate-pulse">
                        0 un em estoque
                      </span>

                      <Link
                        to="/produtos"
                        className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-all"
                        onClick={() => setModalEstoqueAberto(false)}
                      >
                        Repor / Editar
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Atualizado em tempo real com o catálogo</span>
              <button
                type="button"
                onClick={() => setModalEstoqueAberto(false)}
                className="aurora-btn rounded-xl px-4 py-2 font-bold text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL DE DETALHES DO FATURAMENTO & PRODUTOS VENDIDOS */}
      {modalFaturamentoAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          onClick={() => setModalFaturamentoAberto(false)}
        >
          <div
            className="aurora-glass-card w-full max-w-3xl rounded-2xl border border-purple-500/40 p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.3)] relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/20 text-purple-300 text-xl">
                  💰
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Produtos Vendidos & Faturamento
                  </h3>
                  <p className="text-xs text-purple-300 mt-0.5">
                    {vendasConcluidas.length} {vendasConcluidas.length === 1 ? 'venda concluída' : 'vendas concluídas'} • Total líquido: <strong className="text-emerald-300">{formatarMoeda(faturamento)}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalFaturamentoAberto(false)}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Lista das vendas e seus produtos */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {vendasConcluidas.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="text-3xl block mb-2">🛍️</span>
                  Nenhuma venda realizada até o momento.
                </div>
              ) : (
                vendasConcluidas.map((venda) => {
                  const descPercentual = Number(venda.desconto_percentual || 0);
                  const descValor = Number(venda.desconto_valor || 0);
                  const expandida = vendaExpandidaId === venda.id;

                  return (
                    <div
                      key={venda.id}
                      className="rounded-xl border border-purple-500/20 bg-slate-900/60 p-4 transition-all hover:border-purple-500/40"
                    >
                      {/* Resumo da Venda */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-md">
                              Venda #{venda.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(venda.realizada_em).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </span>
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                              {venda.forma_pagamento}
                            </span>
                          </div>

                          {/* Valores e Desconto */}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <span className="text-slate-400">
                              Subtotal: <strong className="text-slate-300">{formatarMoeda(venda.subtotal)}</strong>
                            </span>

                            {descPercentual > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-300">
                                Desconto: {descPercentual}% (-{formatarMoeda(descValor)})
                              </span>
                            ) : (
                              <span className="text-slate-500">Sem desconto (0%)</span>
                            )}

                            <span className="text-slate-400">
                              Total Pago: <strong className="text-emerald-300 text-sm">{formatarMoeda(venda.total)}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alternarItensVenda(venda.id)}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all"
                        >
                          {expandida ? '▲ Ocultar Itens' : '▼ Ver Peças Vendidas'}
                        </button>
                      </div>

                      {/* Lista de itens vendidos nessa venda */}
                      {expandida && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300/90 mb-2">
                            Peças desta venda:
                          </h4>

                          {!venda.itens ? (
                            <p className="text-xs text-slate-400">Carregando peças...</p>
                          ) : venda.itens.length === 0 ? (
                            <p className="text-xs text-slate-400">Nenhum item registrado.</p>
                          ) : (
                            <div className="space-y-2">
                              {venda.itens.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-emerald-400 font-bold">
                                      {item.codigo_produto}
                                    </span>
                                    <span className="font-medium text-slate-200">
                                      {item.nome_produto}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4 text-slate-300">
                                    <span>
                                      Qtd: <strong className="text-white">{item.quantidade}x</strong>
                                    </span>
                                    <span>
                                      Unit: <strong>{formatarMoeda(item.preco_unitario)}</strong>
                                    </span>
                                    <span>
                                      Subtotal: <strong className="text-emerald-300">{formatarMoeda(item.total_item)}</strong>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do modal */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>{vendasConcluidas.length} vendas registradas</span>
              <button
                type="button"
                onClick={() => setModalFaturamentoAberto(false)}
                className="aurora-btn rounded-xl px-5 py-2.5 font-bold text-xs"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
