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
  status: 'CONCLUIDA' | 'CANCELADA';
}

export function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

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

  const estoqueZerado = produtos.filter(
    (produto) => produto.estoque === 0
  ).length;

  const cards = [
    {
      titulo: 'Produtos ativos',
      valor: String(produtos.length),
      descricao: 'Produtos retornados pelo catálogo',
      destaque: 'emerald'
    },
    {
      titulo: 'Vendas concluídas',
      valor: String(vendasConcluidas.length),
      descricao: 'Vendas presentes na consulta atual',
      destaque: 'teal'
    },
    {
      titulo: 'Estoque zerado',
      valor: String(estoqueZerado),
      descricao: 'Produtos sem unidades disponíveis',
      destaque: 'rose'
    },
    {
      titulo: 'Faturamento listado',
      valor: formatarMoeda(faturamento),
      descricao: 'Exclui vendas canceladas',
      destaque: 'purple'
    }
  ];

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
          {cards.map((card) => (
            <article
              key={card.titulo}
              className="aurora-glass-card rounded-2xl p-6"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {card.titulo}
              </h3>

              <p className="aurora-gradient-text mt-3 break-words text-3xl font-black sm:text-4xl">
                {card.valor}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {card.descricao}
              </p>
            </article>
          ))}
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
            Consultar o estoque e cadastrar novas peças.
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
    </div>
  );
}

