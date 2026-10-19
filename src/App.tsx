
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginForm } from './components/LoginForm'; // <-- 1. Importação da nova peça

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-grow w-full mx-auto p-8 flex items-center justify-center">
        {/* 2. Encaixe perfeito do formulário no centro da tela */}
        <LoginForm />
      </main>

      <Footer />
    </div>
  );
}

export default App;
