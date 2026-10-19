// Um componente React é apenas uma função JavaScript que retorna HTML (JSX)!
export function Header() {
    return (
      <header className="bg-slate-800 border-b border-slate-700 p-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">
            Kamikase <span className="text-slate-400 text-sm">| Controle de Estoque</span>
          </h1>
  
          <nav className="flex space-x-4">
            <button className="text-slate-300 hover:text-white transition">Dashboard</button>
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition">
              Sair
            </button>
          </nav>
        </div>
      </header>
    );
  }