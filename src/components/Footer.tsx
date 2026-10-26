export function Footer() {
  return (
    <footer className="relative z-20 mt-auto border-t border-purple-500/20 bg-slate-950/45 p-4 text-center text-sm text-slate-400 backdrop-blur-xl">
      <p>
        &copy; {new Date().getFullYear()}{' '}
        <span className="aurora-gradient-text font-semibold">Aurora</span>.
        Sistema de gerenciamento de vendas.
      </p>
    </footer>
  );
}

