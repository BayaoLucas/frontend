import { useCallback, useEffect, useState } from 'react';

import {
  formatarMoeda,
  obterUsuarioSalvo,
  requisicao,
  type Cliente,
  type Produto,
  type ItemCarrinho,
  type ResultadoSimulacao
} from '../services/api';

interface RespostaVenda {
  mensagem: string;
  venda: {
    id: number;
    total: string;
  };
}

export function Vendas() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [desconto, setDesconto] = useState('0');

  const [emailGerente, setEmailGerente] = useState('');
  const [senhaGerente, setSenhaGerente] = useState('');
  const [confirmarTotalZero, setConfirmarTotalZero] = useState(false);

  const [simulacao, setSimulacao] =
    useState<ResultadoSimulacao | null>(null);

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';
  const percentual = Number(desconto || 0);

  const precisaAutorizacao =
    percentual > 10 && !gerente;

  const subtotalLocal = carrinho.reduce(
    (soma, item) =>
      soma + Number(item.produto.preco) * item.quantidade,
    0
  );

  const totalLocal =
    subtotalLocal * (1 - percentual / 100);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const [listaProdutos, listaClientes] = await Promise.all([
        requisicao<Produto[]>('/produtos'),
        requisicao<Cliente[]>('/clientes')
      ]);

      setProdutos(listaProdutos);
      setClientes(
        listaClientes.filter((cliente) => Number(cliente.ativo) === 1)
      );
    } catch (erroConsulta) {
      setErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : 'Não foi possível carregar os dados da venda.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function invalidarSimulacao() {
    setSimulacao(null);
    setMensagem('');
  }

  function adicionarProduto() {
    setErro('');
    setMensagem('');
    setSimulacao(null);

    const produto = produtos.find(
      (item) => item.id === Number(produtoSelecionado)
    );

    if (!produto) {
      setErro('Selecione um produto válido.');
      return;
    }

    const existente = carrinho.find(
      (item) => item.produto.id === produto.id
    );

    const quantidadeAtual = existente?.quantidade ?? 0;

    if (quantidadeAtual >= produto.estoque) {
      setErro('Não há estoque disponível para adicionar outra unidade.');
      return;
    }

    setCarrinho((atual) => {
      const encontrado = atual.find(
        (item) => item.produto.id === produto.id
      );

      if (encontrado) {
        return atual.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...atual, { produto, quantidade: 1 }];
    });

    setProdutoSelecionado('');
  }

  function alterarQuantidade(produtoId: number, quantidade: number) {
    invalidarSimulacao();
    setErro('');

    const produto = produtos.find((item) => item.id === produtoId);

    if (!produto) {
      return;
    }

    if (quantidade <= 0) {
      setCarrinho((atual) =>
        atual.filter((item) => item.produto.id !== produtoId)
      );
      return;
    }

    if (quantidade > produto.estoque) {
      setErro(`Estoque insuficiente para ${produto.nome}.`);
      return;
    }

    setCarrinho((atual) =>
      atual.map((item) =>
        item.produto.id === produtoId
          ? { ...item, quantidade }
          : item
      )
    );
  }

  function montarPedido() {
    return {
      cliente_id: clienteSelecionado
        ? Number(clienteSelecionado)
        : null,

      forma_pagamento: formaPagamento,
      desconto_percentual: percentual,

      confirmar_total_zero:
        percentual === 100 && confirmarTotalZero,

      itens: carrinho.map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_esperado: item.produto.preco
      })),

      ...(precisaAutorizacao
        ? {
            autorizacao_gerente: {
              email: emailGerente.trim(),
              senha: senhaGerente
            }
          }
        : {})
    };
  }

  function validarPedido(): boolean {
    if (carrinho.length === 0) {
      setErro('Adicione pelo menos um produto ao carrinho.');
      return false;
    }

    if (
      !Number.isFinite(percentual) ||
      percentual < 0 ||
      percentual > 100
    ) {
      setErro('O desconto deve estar entre 0% e 100%.');
      return false;
    }

    if (percentual === 100 && !confirmarTotalZero) {
      setErro('Confirme explicitamente a venda com total zero.');
      return false;
    }

    if (
      precisaAutorizacao &&
      (!emailGerente.trim() || !senhaGerente)
    ) {
      setErro(
        'Informe o e-mail e a senha do gerente para autorizar o desconto.'
      );
      return false;
    }

    return true;
  }

  async function simularVenda() {
    setErro('');
    setMensagem('');
    setSimulacao(null);

    if (!validarPedido()) {
      return;
    }

    setProcessando(true);

    try {
      const resultado =
        await requisicao<ResultadoSimulacao>(
          '/vendas/simular',
          {
            method: 'POST',
            body: JSON.stringify(montarPedido())
          }
        );

      setSimulacao(resultado);
    } catch (erroSimulacao) {
      setErro(
        erroSimulacao instanceof Error
          ? erroSimulacao.message
          : 'Não foi possível simular a venda.'
      );
    } finally {
      setProcessando(false);
    }
  }

  async function finalizarVenda() {
    setErro('');
    setMensagem('');

    if (!validarPedido()) {
      return;
    }

    setProcessando(true);

    try {
      const resposta = await requisicao<RespostaVenda>(
        '/vendas',
        {
          method: 'POST',
          body: JSON.stringify(montarPedido())
        }
      );

      setMensagem(
        `Venda nº ${resposta.venda.id} concluída com sucesso. Total: ${formatarMoeda(resposta.venda.total)}.`
      );

      setCarrinho([]);
      setClienteSelecionado('');
      setFormaPagamento('DINHEIRO');
      setDesconto('0');
      setEmailGerente('');
      setSenhaGerente('');
      setConfirmarTotalZero(false);
      setSimulacao(null);

      await carregarDados();
    } catch (erroFinalizacao) {
      setErro(
        erroFinalizacao instanceof Error
          ? erroFinalizacao.message
          : 'Não foi possível finalizar a venda.'
      );

      setSimulacao(null);
    } finally {
      setProcessando(false);
    }
  }

  if (carregando) {
    return <p className="text-slate-400">Carregando produtos e clientes...</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold">Nova venda</h2>
        <p className="mt-2 text-slate-400">
          Selecione os produtos, confira os valores e finalize a compra.
        </p>
      </section>

      {erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300"
        >
          {mensagem}
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Adicionar produtos</h3>

        {produtos.length === 0 ? (
          <p className="text-slate-400">
            Nenhum produto disponível. Cadastre produtos antes de iniciar uma venda.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={produtoSelecionado}
              onChange={(e) => setProdutoSelecionado(e.target.value)}
              className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 p-3"
            >
              <option value="">Selecione uma peça</option>

              {produtos
                .filter((produto) => produto.estoque > 0)
                .map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.codigo} - {produto.nome}
                    {' | '}
                    {formatarMoeda(produto.preco)}
                    {' | Estoque: '}
                    {produto.estoque}
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={adicionarProduto}
              disabled={!produtoSelecionado}
              className="rounded bg-cyan-600 px-5 py-3 font-bold hover:bg-cyan-500 disabled:opacity-50"
            >
              Adicionar ao carrinho
            </button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Carrinho</h3>

        {carrinho.length === 0 ? (
          <p className="text-slate-400">
            Seu carrinho está vazio.
          </p>
        ) : (
          <div className="space-y-4">
            {carrinho.map((item) => (
              <article
                key={item.produto.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold">{item.produto.nome}</h4>
                  <p className="text-sm text-slate-400">
                    Código: {item.produto.codigo}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatarMoeda(item.produto.preco)} por unidade
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      alterarQuantidade(
                        item.produto.id,
                        item.quantidade - 1
                      )
                    }
                    className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700"
                    aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center">
                    {item.quantidade}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      alterarQuantidade(
                        item.produto.id,
                        item.quantidade + 1
                      )
                    }
                    className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700"
                    aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                  >
                    +
                  </button>

                  <span className="min-w-28 text-right font-semibold">
                    {formatarMoeda(
                      Number(item.produto.preco) * item.quantidade
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => alterarQuantidade(item.produto.id, 0)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-bold">Dados da venda</h3>

          <div>
            <label
              htmlFor="cliente"
              className="mb-2 block text-sm text-slate-300"
            >
              Cliente (opcional)
            </label>

            <select
              id="cliente"
              value={clienteSelecionado}
              onChange={(e) => {
                setClienteSelecionado(e.target.value);
                invalidarSimulacao();
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 p-3"
            >
              <option value="">Venda sem identificação de cliente</option>

              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - CPF: {cliente.cpf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pagamento"
              className="mb-2 block text-sm text-slate-300"
            >
              Forma de pagamento
            </label>

            <select
              id="pagamento"
              value={formaPagamento}
              onChange={(e) => {
                setFormaPagamento(e.target.value);
                invalidarSimulacao();
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 p-3"
            >
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="DEBITO">Cartão de débito</option>
              <option value="CREDITO">Cartão de crédito</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="desconto"
              className="mb-2 block text-sm text-slate-300"
            >
              Desconto percentual
            </label>

            <input
              id="desconto"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={desconto}
              onChange={(e) => {
                setDesconto(e.target.value);
                setConfirmarTotalZero(false);
                setSimulacao(null);
                setMensagem('');
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 p-3"
            />

            {precisaAutorizacao && (
              <p className="mt-2 text-sm text-amber-300">
                Descontos acima de 10% precisam de autorização gerencial.
              </p>
            )}
          </div>

          {precisaAutorizacao && (
            <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h4 className="font-semibold text-amber-200">
                Autorização do gerente
              </h4>

              <div>
                <label
                  htmlFor="emailGerente"
                  className="mb-1 block text-sm text-slate-300"
                >
                  E-mail do gerente
                </label>

                <input
                  id="emailGerente"
                  type="email"
                  value={emailGerente}
                  onChange={(e) => {
                    setEmailGerente(e.target.value);
                    invalidarSimulacao();
                  }}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-3"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="senhaGerente"
                  className="mb-1 block text-sm text-slate-300"
                >
                  Senha do gerente
                </label>

                <input
                  id="senhaGerente"
                  type="password"
                  autoComplete="off"
                  value={senhaGerente}
                  onChange={(e) => {
                    setSenhaGerente(e.target.value);
                    invalidarSimulacao();
                  }}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-3"
                  required
                />
              </div>
            </div>
          )}

          {percentual === 100 && (
            <label className="flex items-start gap-3 rounded-lg border border-amber-500/30 p-4 text-sm text-amber-200">
              <input
                type="checkbox"
                checked={confirmarTotalZero}
                onChange={(e) => {
                  setConfirmarTotalZero(e.target.checked);
                  invalidarSimulacao();
                }}
                className="mt-1"
              />
              Confirmo que esta venda terá total de R$ 0,00.
            </label>
          )}
        </div>

        <div className="h-fit rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 text-xl font-bold">Resumo da venda</h3>

          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between gap-4">
              <span>Itens no carrinho</span>
              <span>
                {carrinho.reduce(
                  (soma, item) => soma + item.quantidade,
                  0
                )}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Subtotal estimado</span>
              <span>{formatarMoeda(subtotalLocal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Desconto ({percentual || 0}%)</span>
              <span>
                {formatarMoeda(subtotalLocal - totalLocal)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-slate-700 pt-4 text-xl font-extrabold text-cyan-400">
              <span>Total estimado</span>
              <span>{formatarMoeda(totalLocal)}</span>
            </div>
          </div>

          {simulacao && (
            <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h4 className="font-semibold text-emerald-300">
                Simulação calculada pelo servidor
              </h4>

              <p className="mt-2 text-sm text-slate-300">
                Subtotal: {formatarMoeda(simulacao.subtotal)}
              </p>

              <p className="text-sm text-slate-300">
                Desconto: {formatarMoeda(simulacao.descontoValor)}
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-300">
                Total: {formatarMoeda(simulacao.total)}
              </p>

              {simulacao.necessita_autorizacao && (
                <p className="mt-2 text-sm text-amber-300">
                  A venda exige autorização de um gerente para ser concluída.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={simularVenda}
              disabled={processando || carrinho.length === 0}
              className="w-full rounded border border-cyan-500 px-4 py-3 font-bold text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
            >
              {processando ? 'Processando...' : 'Simular venda'}
            </button>

            <button
              type="button"
              onClick={finalizarVenda}
              disabled={processando || carrinho.length === 0}
              className="w-full rounded bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {processando ? 'Processando...' : 'Finalizar venda'}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Os valores exibidos antes da simulação são estimativas locais.
            O servidor valida os preços e o estoque antes de registrar a venda.
          </p>
        </div>
      </section>
    </div>
  );
}