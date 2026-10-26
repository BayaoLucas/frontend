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
      descricao: 'Produtos retornados pelo catálogo'
    },
    {
      titulo: 'Vendas concluídas',
      valor: String(vendasConcluidas.length),
      descricao: 'Vendas presentes na consulta atual'
    },
    {
      titulo: 'Estoque zerado',
      valor: String(estoqueZerado),
      descricao: 'Produtos sem unidades disponíveis'
    },
    {
      titulo: 'Faturamento das vendas listadas',
      valor: formatarMoeda(faturamento),
      descricao: 'Exclui vendas canceladas'
    }
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Painel de controle</h2>
          <p className="mt-2 text-slate-400">
            Acompanhe os produtos e as vendas da MS² Vestuário.
          </p>
        </div>

        <Link
          to="/vendas"
          className="rounded-lg bg-cyan-600 px-5 py-3 font-bold text-white transition hover:bg-cyan-500"
        >
          Iniciar venda
        </Link>
      </section>

      {erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300"
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="text-slate-400">Carregando informações...</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.titulo}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h3 className="text-sm font-semibold text-slate-400">
                {card.titulo}
              </h3>

              <p className="mt-3 break-words text-3xl font-extrabold text-cyan-400">
                {card.valor}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {card.descricao}
              </p>
            </article>
          ))}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/produtos"
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500"
        >
          <h3 className="text-xl font-bold">Catálogo de produtos</h3>
          <p className="mt-2 text-slate-400">
            Consultar o estoque e cadastrar novas peças.
          </p>
        </Link>

        <Link
          to="/vendas"
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500"
        >
          <h3 className="text-xl font-bold">Área de vendas</h3>
          <p className="mt-2 text-slate-400">
            Selecionar produtos, montar o carrinho e concluir uma venda.
          </p>
        </Link>
      </section>
    </div>
  );
}