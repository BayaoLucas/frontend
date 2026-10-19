// 1. Importamos o Hook de estado de dentro da biblioteca principal do React
import { useState } from 'react';

export function LoginForm() {

  // 2. DECLARAÇÃO DO ESTADO (A Memória RAM)
  // A sintaxe é uma desestruturação de Array: [variável_de_leitura, função_para_alterar]
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // 3. A Função que intercepta o envio do formulário (O Controller do Front-end)
  const lidarComSubmit = (evento: React.FormEvent) => {
    evento.preventDefault(); // Impede o navegador de recarregar a página (Comportamento clássico do HTML)

    // Aqui temos a garantia absoluta de que as variáveis contêm o que o usuário digitou
    console.log('Tentativa de Login interceptada!');
    console.log('E-mail capturado:', email);
    console.log('Senha capturada:', senha);

    // No próximo módulo, enviaremos isso para a porta 3000 (Nosso Back-end)
  };

  return (
    <form onSubmit={lidarComSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesso ao Sistema</h2>

      <div className="mb-4">
        <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="email">
          E-mail Corporativo
        </label>

        <input
          id="email"
          type="email"
          // O valor do input está amarrado ao Estado (O HTML é escravo do React)
          value={email}
          // Quando o usuário digita, avisamos o React para atualizar o Estado
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-cyan-500 transition"
          placeholder="soldado@kamikase.com"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="senha">
          Senha
        </label>

        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-cyan-500 transition"
          placeholder="********"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded transition"
      >
        Entrar no Quartel
      </button>
    </form>
  );
}