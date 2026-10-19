import { LoginForm } from '../components/LoginForm';

export function Login() {
  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-cyan-400 mb-2">QG Kamikase</h2>
        <p className="text-slate-400">Entre com suas credenciais para gerenciar o estoque</p>
      </div>

      {/* Acoplamos o nosso bloco de formulário aqui dentro */}
      <LoginForm />
    </div>
  );
}