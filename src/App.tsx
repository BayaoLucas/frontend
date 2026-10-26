import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes
} from 'react-router-dom';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './styles/global.css';
import './styles/aurora.css';
import './styles/layout.css';
import './styles/login.css';
import './styles/dashboard.css';
import './styles/produtos.css';
import './styles/vendas.css';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Produtos } from './pages/Produtos.tsx';
import { Vendas } from './pages/Vendas.tsx';

import { obterUsuarioSalvo } from './services/api';

function RotaProtegida() {
  const token = localStorage.getItem('ms2_token');
  const usuario = obterUsuarioSalvo();

  if (!token || !usuario) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function RotaPublica() {
  const token = localStorage.getItem('ms2_token');
  const usuario = obterUsuarioSalvo();

  if (token && usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Header />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<RotaPublica />} />

            <Route element={<RotaProtegida />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/vendas" element={<Vendas />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;