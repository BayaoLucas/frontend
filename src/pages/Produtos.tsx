import { useCallback, useEffect, useState, type FormEvent } from 'react';

import {
  formatarMoeda,
  obterUsuarioSalvo,
  requisicao,
  type Produto
} from '../services/api';

const OPCOES_TAMANHO = [
  'PP',
  'P',
  'M',
  'G',
  'GG',
  'XG',
  'Único',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  '48',
  'Outro'
];

const formularioInicial = {
  nome: '',
  descricao: '',
  tamanhoOpcao: 'M',
  tamanhoPersonalizado: '',
  cor: '',
  genero: 'UNISSEX',
  preco: '',
  estoque: '0'
};

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [codigoAleatorioPreview, setCodigoAleatorioPreview] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroTamanho, setFiltroTamanho] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [produtoAvisoEstoque, setProdutoAvisoEstoque] = useState<Produto | null>(null);

  const usuario = obterUsuarioSalvo();
  const gerente = usuario?.perfil === 'GERENTE';

  const gerarNovoCodigoPreview = useCallback(async () => {
    if (!gerente) return;
    try {
      const resp = await requisicao<{ codigoAleatorio: string }>('/produtos/proximo-codigo');
      setCodigoAleatorioPreview(resp.codigoAleatorio);
    } catch {
      // Ignora erro de previsão silenciosamente
    }
  }, [gerente]);

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const params = new URLSearchParams();
      if (pesquisa.trim()) params.append('termo', pesquisa.trim());
      if (filtroGenero) params.append('genero', filtroGenero);

      const qs = params.toString();
      const caminho = qs ? `/produtos?${qs}` : '/produtos';

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
  }, [pesquisa, filtroGenero]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void carregarProdutos();
    }, 250);

    return () => window.clearTimeout(temporizador);
  }, [carregarProdutos]);

  useEffect(() => {
    void gerarNovoCodigoPreview();
  }, [gerarNovoCodigoPreview]);

  function iniciarEdicao(produto: Produto) {
    setProdutoEditando(produto);

    const tamExistente = produto.tamanho || '';
    const ehPadrao = OPCOES_TAMANHO.includes(tamExistente);

    setFormulario({
      nome: produto.nome,
      descricao: produto.descricao || '',
      tamanhoOpcao: ehPadrao ? tamExistente : 'Outro',
      tamanhoPersonalizado: ehPadrao ? '' : tamExistente,
      cor: produto.cor || '',
      genero: produto.genero || 'UNISSEX',
      preco: produto.preco,
      estoque: String(produto.estoque)
    });
    setMensagem('');
    setErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setProdutoEditando(null);
    setFormulario(formularioInicial);
    setErro('');
    void gerarNovoCodigoPreview();
  }

  async function salvarProduto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);

    const tamanhoFinal = formulario.tamanhoOpcao === 'Outro'
      ? formulario.tamanhoPersonalizado.trim()
      : formulario.tamanhoOpcao;

    try {
      if (produtoEditando) {
        // Atualização de produto existente
        const atualizado = await requisicao<Produto>(`/produtos/${produtoEditando.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            codigo: produtoEditando.codigo,
            nome: formulario.nome.trim(),
            descricao: formulario.descricao.trim() || null,
            tamanho: tamanhoFinal || null,
            cor: formulario.cor.trim() || null,
            genero: formulario.genero,
            preco: formulario.preco.replace(',', '.'),
            estoque: Number(formulario.estoque)
          })
        });

        setMensagem(`Produto [${atualizado.codigo}] "${atualizado.nome}" atualizado com sucesso!`);
        cancelarEdicao();
      } else {
        // Cadastro de novo produto com código aleatório
        const novoProduto = await requisicao<Produto>('/produtos', {
          method: 'POST',
          body: JSON.stringify({
            codigo: codigoAleatorioPreview || undefined,
            nome: formulario.nome.trim(),
            descricao: formulario.descricao.trim() || null,
            tamanho: tamanhoFinal || null,
            cor: formulario.cor.trim() || null,
            genero: formulario.genero,
            preco: formulario.preco.replace(',', '.'),
            estoque: Number(formulario.estoque)
          })
        });

        setFormulario(formularioInicial);
        setMensagem(`Produto cadastrado com sucesso com o código aleatório [${novoProduto.codigo}]!`);
        await gerarNovoCodigoPreview();
      }

      await carregarProdutos();
    } catch (erroSalvar) {
      setErro(
        erroSalvar instanceof Error
          ? erroSalvar.message
          : 'Não foi possível salvar o produto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const produtosFiltrados = produtos.filter((p) => {
    if (!filtroTamanho) return true;
    return (p.tamanho || '').toUpperCase() === filtroTamanho.toUpperCase();
  });

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ESTOQUE & CATÁLOGO AURORA
        </div>
        <h2 className="aurora-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
          Produtos
        </h2>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">
          Gerencie o catálogo, consulte os modelos feminino, masculino e unissex e selecione tamanhos de forma ágil.
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
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${produtoEditando ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              {produtoEditando ? `Editar Produto [${produtoEditando.codigo}]` : 'Cadastrar novo produto'}
            </h3>

            {produtoEditando && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                ✕ Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={salvarProduto} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="codigo" className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-300/90">
                <span>Código do Produto</span>
                <span className="text-[10px] lowercase text-emerald-400 font-normal">
                  {produtoEditando ? '(imutável nesta peça)' : '(aleatório e único)'}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="codigo"
                  value={produtoEditando ? produtoEditando.codigo : (codigoAleatorioPreview || 'Gerando...')}
                  disabled
                  readOnly
                  className="aurora-input w-full rounded-xl p-3 font-mono font-bold text-emerald-300 outline-none cursor-not-allowed opacity-90"
                />
                {!produtoEditando && (
                  <button
                    type="button"
                    onClick={gerarNovoCodigoPreview}
                    title="Sortear outro código aleatório"
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all text-sm"
                  >
                    🎲 Novo
                  </button>
                )}
              </div>
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
                placeholder="Ex: Vestido Aurora Floral / Camisa Linho"
              />
            </div>

            <div>
              <label htmlFor="genero" className="mb-1 block text-xs font-bold uppercase tracking-wider text-violet-300/90">
                Categoria de Gênero
              </label>
              <select
                id="genero"
                value={formulario.genero}
                onChange={(e) => setFormulario({ ...formulario, genero: e.target.value })}
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
              >
                <option value="FEMININO">🌸 Feminino</option>
                <option value="MASCULINO">👔 Masculino</option>
                <option value="UNISSEX">✨ Unissex</option>
              </select>
            </div>

            <div>
              <label htmlFor="tamanhoOpcao" className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-300/90">
                <span>Tamanho da Roupa</span>
                <span className="text-[10px] text-purple-300 font-normal">
                  {formulario.tamanhoOpcao === 'Outro' ? 'Digite ao lado' : 'Clique para escolher'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  id="tamanhoOpcao"
                  value={formulario.tamanhoOpcao}
                  onChange={(e) => setFormulario({ ...formulario, tamanhoOpcao: e.target.value })}
                  className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                >
                  <optgroup label="Tamanhos Tradicionais">
                    <option value="PP">PP</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                    <option value="XG">XG</option>
                    <option value="Único">Tamanho Único</option>
                  </optgroup>
                  <optgroup label="Numerações">
                    <option value="34">34</option>
                    <option value="36">36</option>
                    <option value="38">38</option>
                    <option value="40">40</option>
                    <option value="42">42</option>
                    <option value="44">44</option>
                    <option value="46">46</option>
                    <option value="48">48</option>
                  </optgroup>
                  <optgroup label="Personalizado">
                    <option value="Outro">✏️ Outro (digitar manual)</option>
                  </optgroup>
                </select>

                {formulario.tamanhoOpcao === 'Outro' ? (
                  <input
                    id="tamanhoPersonalizado"
                    value={formulario.tamanhoPersonalizado}
                    onChange={(e) => setFormulario({ ...formulario, tamanhoPersonalizado: e.target.value })}
                    maxLength={20}
                    required
                    placeholder="Digite o tamanho (ex: G1, 50...)"
                    className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none border-purple-500/50"
                  />
                ) : (
                  <div className="hidden sm:flex items-center px-3 text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                    Selecionado: <strong className="ml-1 text-emerald-300">{formulario.tamanhoOpcao}</strong>
                  </div>
                )}
              </div>
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
                placeholder="Ex: Esmeralda, Violeta, Preto, Branco"
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

            <div>
              <label htmlFor="descricao" className="mb-1 block text-xs font-bold uppercase tracking-wider text-purple-300/90">
                Descrição (opcional)
              </label>
              <input
                id="descricao"
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                className="aurora-input w-full rounded-xl p-3 text-slate-100 outline-none"
                placeholder="Ex: Tecido 100% algodão egípcio"
              />
            </div>

            <div className="flex items-end md:col-span-2">
              <button
                type="submit"
                disabled={salvando}
                className="aurora-btn w-full rounded-xl p-3.5 font-bold disabled:opacity-50"
              >
                {salvando
                  ? 'Processando...'
                  : produtoEditando
                    ? '✓ Salvar Alterações do Produto'
                    : '✦ Cadastrar Produto com Código Aleatório'}
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

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={filtroGenero}
              onChange={(e) => setFiltroGenero(e.target.value)}
              className="aurora-input rounded-xl p-2.5 text-sm text-slate-100 outline-none"
            >
              <option value="">Todos os gêneros</option>
              <option value="FEMININO">🌸 Feminino</option>
              <option value="MASCULINO">👔 Masculino</option>
              <option value="UNISSEX">✨ Unissex</option>
            </select>

            <select
              value={filtroTamanho}
              onChange={(e) => setFiltroTamanho(e.target.value)}
              className="aurora-input rounded-xl p-2.5 text-sm text-slate-100 outline-none"
            >
              <option value="">Todos os tamanhos</option>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
              <option value="XG">XG</option>
              <option value="Único">Único</option>
            </select>

            <input
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar por nome, código ou cor..."
              className="aurora-input w-full sm:w-60 rounded-xl p-2.5 text-sm text-slate-100 outline-none"
            />
          </div>
        </div>

        {carregando ? (
          <p className="text-slate-400">Carregando produtos...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="text-slate-400">Nenhum produto encontrado no catálogo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-emerald-500/20 text-emerald-300/80">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Gênero</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Cor</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                  {gerente && <th className="p-3 text-right">Ações</th>}
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="border-b border-slate-800/60 transition-colors hover:bg-emerald-500/5">
                    <td className="p-3 font-mono text-xs font-bold text-emerald-300">{produto.codigo}</td>
                    <td className="p-3 font-medium text-slate-100">{produto.nome}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        produto.genero === 'FEMININO'
                          ? 'border border-pink-500/30 bg-pink-500/15 text-pink-300'
                          : produto.genero === 'MASCULINO'
                            ? 'border border-blue-500/30 bg-blue-500/15 text-blue-300'
                            : 'border border-purple-500/30 bg-purple-500/15 text-purple-300'
                      }`}>
                        {produto.genero === 'FEMININO' ? '🌸 Feminino' : produto.genero === 'MASCULINO' ? '👔 Masculino' : '✨ Unissex'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-200 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-md text-xs">
                        {produto.tamanho || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{produto.cor || '-'}</td>
                    <td className="p-3 font-semibold text-slate-200">{formatarMoeda(produto.preco)}</td>
                    <td className="p-3">
                      {produto.estoque === 0 ? (
                        <button
                          type="button"
                          onClick={() => setProdutoAvisoEstoque(produto)}
                          title="Clique para ver detalhes do produto em falta"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/35 hover:border-rose-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:scale-105 active:scale-95"
                        >
                          <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                          <span>0 un • Em Falta</span>
                        </button>
                      ) : (
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                          {produto.estoque} un
                        </span>
                      )}
                    </td>
                    {gerente && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(produto)}
                          className="rounded-lg border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/25 hover:border-purple-500/50 transition-all"
                        >
                          ✎ Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {/* MODAL / TELA DE AVISO DE PRODUTO EM FALTA */}
      {produtoAvisoEstoque && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setProdutoAvisoEstoque(null)}
        >
          <div
            className="aurora-glass-card w-full max-w-lg rounded-2xl border border-rose-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-rose-500/20 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/20 text-rose-300 text-2xl">
                ⚠️
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                  ESTOQUE ESGOTADO
                </span>
                <h3 className="text-xl font-black text-slate-100 mt-1">
                  Produto em Falta
                </h3>
              </div>
            </div>

            <div className="py-5 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Código do Produto:</span>
                  <strong className="font-mono text-emerald-300 text-sm">
                    {produtoAvisoEstoque.codigo}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Nome da Peça:</span>
                  <strong className="text-slate-100 text-sm">
                    {produtoAvisoEstoque.nome}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Gênero:</span>
                  <span className="font-semibold text-slate-200">
                    {produtoAvisoEstoque.genero || 'Unissex'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Tamanho:</span>
                  <span className="font-semibold text-slate-200">
                    {produtoAvisoEstoque.tamanho || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Cor:</span>
                  <span className="font-semibold text-slate-200">
                    {produtoAvisoEstoque.cor || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-2.5">
                  <span>Preço unitário:</span>
                  <strong className="text-emerald-300 text-sm">
                    {formatarMoeda(produtoAvisoEstoque.preco)}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                <span className="text-base">🚨</span>
                <p>
                  <strong>Atenção:</strong> Esta peça possui <strong>0 unidades</strong> no estoque. Não é possível concluir vendas deste item até que o estoque seja reposto.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              {gerente && (
                <button
                  type="button"
                  onClick={() => {
                    iniciarEdicao(produtoAvisoEstoque);
                    setProdutoAvisoEstoque(null);
                  }}
                  className="aurora-btn rounded-xl px-4 py-2 font-bold text-xs"
                >
                  ✎ Repor Estoque Agora
                </button>
              )}

              <button
                type="button"
                onClick={() => setProdutoAvisoEstoque(null)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
