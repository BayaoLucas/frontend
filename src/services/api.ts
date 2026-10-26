const API_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  ).replace(/\/+$/, '');
  
  export interface UsuarioLogado {
    id: number;
    nome: string;
    email: string;
    perfil: 'CAIXA' | 'GERENTE';
    ativo: number;
  }
  
  export interface Produto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tamanho: string | null;
    cor: string | null;
    preco: string;
    estoque: number;
    ativo: number;
  }
  
  export interface Cliente {
    id: number;
    nome: string;
    cpf: string;
    telefone: string | null;
    email: string | null;
    ativo: number;
  }
  
  export interface ItemCarrinho {
    produto: Produto;
    quantidade: number;
  }
  
  export interface ResultadoSimulacao {
    itens: {
      produtoId: number;
      codigo: string;
      nome: string;
      quantidade: number;
      preco: string;
      total: string;
    }[];
    subtotal: string;
    descontoValor: string;
    descontoPercentual: string;
    total: string;
    necessita_autorizacao: boolean;
  }
  
  interface RespostaErro {
    erro?: string;
    mensagem?: string;
  }
  
  export async function requisicao<T>(
    caminho: string,
    opcoes: RequestInit = {}
  ): Promise<T> {
    const cabecalhos = new Headers(opcoes.headers);
  
    if (opcoes.body && !cabecalhos.has('Content-Type')) {
      cabecalhos.set('Content-Type', 'application/json');
    }
  
    const token = localStorage.getItem('ms2_token');
  
    if (token) {
      cabecalhos.set('Authorization', `Bearer ${token}`);
    }
  
    let resposta: Response;
  
    try {
      resposta = await fetch(`${API_URL}${caminho}`, {
        ...opcoes,
        headers: cabecalhos
      });
    } catch {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
      );
    }
  
    if (resposta.status === 204) {
      return undefined as T;
    }
  
    let dados: unknown;
  
    try {
      dados = await resposta.json();
    } catch {
      dados = null;
    }
  
    if (!resposta.ok) {
      const erro = dados as RespostaErro | null;
  
      if (resposta.status === 401) {
        limparSessao();
      }
  
      throw new Error(
        erro?.erro ||
        erro?.mensagem ||
        `A requisição falhou. Código HTTP: ${resposta.status}.`
      );
    }
  
    return dados as T;
  }
  
  export function salvarSessao(
    token: string,
    usuario: UsuarioLogado
  ): void {
    localStorage.setItem('ms2_token', token);
    localStorage.setItem('ms2_usuario', JSON.stringify(usuario));
  }
  
  export function obterUsuarioSalvo(): UsuarioLogado | null {
    const dados = localStorage.getItem('ms2_usuario');
  
    if (!dados) {
      return null;
    }
  
    try {
      return JSON.parse(dados) as UsuarioLogado;
    } catch {
      limparSessao();
      return null;
    }
  }
  
  export function limparSessao(): void {
    localStorage.removeItem('ms2_token');
    localStorage.removeItem('ms2_usuario');
  }
  
  export function formatarMoeda(valor: string | number): string {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }