import { LoginForm } from '../components/LoginForm';

export function Login() {
  return (
    <div className="mx-auto w-full max-w-md py-8 sm:py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          SISTEMA DE VENDAS
        </div>

        <h2 className="aurora-gradient-text text-5xl font-black tracking-tight sm:text-6xl">
          Aurora
        </h2>

        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Entre com suas credenciais para gerenciar o estoque e as vendas
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
