// 1. Importamos as ferramentas de roteamento da biblioteca
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 2. Importamos os nossos layouts fixos
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// 3. Importamos as nossas Páginas cheias
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    // O BrowserRouter liga o monitoramento da URL do navegador
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 flex flex-col">

        {/* O Header fica fixo no topo, independente da página que mudar abaixo */}
        <Header />

        {/* Área dinâmica que vai trocar de conteúdo baseada na rota */}
        <main className="flex-grow w-full max-w-6xl mx-auto p-8 flex items-center justify-center">

          {/* O container Routes decide qual Route bate com a URL atual */}
          <Routes>
            {/* Se a URL for exatamente "/", renderiza a tela de Login */}
            <Route path="/" element={<Login />} />

            {/* Se a URL for "/dashboard", renderiza o Painel de Controle */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>

        </main>

        {/* O Footer fica fixo na base do sistema */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;