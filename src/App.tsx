import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes
} from 'react-router-dom';

import { FundoAurora } from './components/FundoAurora';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './Styles/global.css';
import './Styles/aurora.css';
import './Styles/layout.css';
import './Styles/login.css';
import './Styles/produtos.css';
import './Styles/vendas.css';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Produtos } from './pages/Produtos';
import { Catalogo } from './pages/Catalogo';
import { Vendas } from './pages/Vendas';
import { Usuarios } from './pages/Usuarios';

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
      <div className="relative flex min-h-screen flex-col text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        <FundoAurora />
        <Header />

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<RotaPublica />} />

            <Route element={<RotaProtegida />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/usuarios" element={<Usuarios />} />
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
