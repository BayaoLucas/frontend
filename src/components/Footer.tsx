export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 p-4 text-center text-sm text-slate-500">
      <p>
        &copy; {new Date().getFullYear()} MS² Vestuário.
        Sistema de gerenciamento de vendas.
      </p>
    </footer>
  );
}