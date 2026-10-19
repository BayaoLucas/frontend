export function Dashboard() {
    return (
      <div className="w-full bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
        <div className="border-b border-slate-700 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Painel de Controle</h2>
            <p className="text-slate-400 text-sm">Visão geral do inventário e categorias</p>
          </div>
  
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
            Acesso Autenticado
          </span>
        </div>
  
        {/* Grid de simulação de dados que vêm do banco */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Produtos Cadastrados</h3>
            <p className="text-4xl font-black text-cyan-400 mt-2">142</p>
          </div>
  
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Categorias Ativas</h3>
            <p className="text-4xl font-black text-purple-400 mt-2">12</p>
          </div>
  
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Alertas de Estoque Zero</h3>
            <p className="text-4xl font-black text-red-400 mt-2">3</p>
          </div>
        </div>
      </div>
    );
  }