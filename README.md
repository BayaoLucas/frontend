Aurora Vestuário
Criado por: Lucas Bayão e Pedro Henrique
Sistema web para gerenciamento de produtos, catálogo e vendas de uma loja de vestuário. O frontend utiliza React e TypeScript e apresenta uma identidade visual escura inspirada em auroras boreais, com gradientes, efeitos de luz e fundo animado.
Este repositório contém o frontend. O acesso a dados reais depende do backend e do banco de dados configurados separadamente.

Sumário
- Visão geral
- Funcionalidades
- Tecnologias
- Pré-requisitos
- Instalação e execução
- Configuração da API
- Rotas
- Estrutura do projeto
- Autenticação e permissões
- Identidade visual
- Scripts
- Integração com o backend
- Segurança e observações

Visão geral
O Aurora Vestuário reúne telas para autenticação, consulta de produtos, visualização de catálogo, operação de vendas e gerenciamento de usuários. É uma Single Page Application (SPA), com navegação por rotas e comunicação HTTP com uma API.
Funcionalidades
Login e sessão
- Formulário de acesso por credenciais.
- Armazenamento local do token e dos dados básicos do usuário.
- Envio do token em requisições autenticadas pelo cabeçalho Authorization: Bearer <token>.
- Encerramento da sessão e proteção de navegação para páginas internas.
Painel de controle
- Consulta de produtos e vendas pela API.
- Indicadores de produtos, vendas concluídas e faturamento calculado com os dados carregados.
- Identificação de produtos sem estoque.
- Visualização de informações e itens de vendas.
Produtos
- Listagem, pesquisa e filtro por gênero.
- Cadastro e edição de produtos.
- Campos para nome, descrição, tamanho, cor, gênero, preço, estoque e imagem.
- Controle de visibilidade no catálogo.
- Exclusão de produtos.
- Ações administrativas sujeitas às permissões do backend.
Catálogo
- Consulta dos produtos exibidos no catálogo.
- Carregamento de dados pela API.
- Adição de produtos ao carrinho, considerando o estoque informado.
Vendas
- Montagem da venda por meio de um carrinho.
- Inclusão, remoção e ajuste de quantidades.
- Resumo de subtotal, desconto e total.
- Seleção da forma de pagamento e envio da operação à API.
Usuários
- Tela de gerenciamento de usuários para gerente.
- Cadastro com nome, e-mail, senha inicial e perfil.
- Inativação e reativação de usuários.
- Perfis disponíveis na interface: CAIXA e GERENTE.
As funcionalidades que dependem do servidor só funcionarão se o backend disponibilizar as rotas correspondentes e validar as regras de negócio.
Tecnologias
Tecnologia	Utilização
React 19	Interface baseada em componentes
TypeScript	Tipagem estática
Vite 8	Desenvolvimento e build
React Router DOM 7	Navegação por rotas
Tailwind CSS 4	Estilização utilitária
CSS	Layout, estilos globais e tema visual
Fetch API	Requisições HTTP à API
ESLint	Análise estática do código


Pré-requisitos
- Node.js compatível com Vite 8 (recomenda-se Node.js 22.12 ou superior).
- npm, instalado com o Node.js.
- Backend executando e acessível.
- MySQL configurado no backend.
O navegador não acessa o MySQL diretamente. O fluxo é:

Navegador → Frontend React → API Backend → MySQL
Instalação e execução
1. Clonar o repositório
git clone https://github.com/BayaoLucas/frontend.git
cd frontend
2. Instalar as dependências
npm install
3. Configurar a API
Crie um arquivo .env na raiz do projeto:
VITE_API_URL=http://localhost:3000/api
O valor acima corresponde ao endereço local esperado para a API. Caso o backend esteja em outra porta ou endereço, ajuste a URL. Variáveis acessíveis pelo Vite precisam começar com VITE_.
4. Executar em desenvolvimento
npm run dev
Abra o endereço indicado no terminal, normalmente http://localhost:5173. Mantenha o backend iniciado em outro terminal.
5. Gerar build de produção
npm run build
O comando verifica os projetos TypeScript e gera a versão de produção na pasta dist/.

Para visualizar o build localmente:
npm run preview
Configuração da API
A comunicação com o servidor está centralizada em src/services/api.ts. A URL base é lida de VITE_API_URL; quando não definida, o código utiliza http://localhost:3000/api.

O helper de requisições:
- define Content-Type: application/json quando necessário;
- inclui o token salvo no cabeçalho Authorization, quando disponível;
- trata respostas HTTP 204 sem conteúdo;
- tenta interpretar a resposta como JSON;
- apresenta mensagens de erro retornadas pela API ou o código HTTP;
- limpa a sessão local quando recebe HTTP 401.
O backend deve permitir requisições da origem do frontend por meio de uma configuração CORS apropriada.
Rotas
Rota	Página	Acesso na interface
/	Login	Pública; com sessão, encaminha para o painel
/dashboard	Painel de controle	Requer sessão
/catalogo	Catálogo	Requer sessão
/produtos	Gerenciamento de produtos	Requer sessão; ações administrativas dependem de permissão
/vendas	Operação de vendas	Requer sessão
/usuarios	Gerenciamento de usuários	Restrita a gerente na interface


As verificações no frontend melhoram a navegação, mas não substituem a autenticação e a autorização no backend. O servidor precisa validar token, perfil e permissões em cada operação protegida. Caminhos desconhecidos são redirecionados para /dashboard.
Estrutura do projeto
frontend/
├── public/                   # Arquivos públicos estáticos
├── src/
│   ├── components/
│   │   ├── Footer.tsx        # Rodapé
│   │   ├── FundoAurora.tsx   # Fundo animado em canvas
│   │   ├── Header.tsx        # Cabeçalho e navegação
│   │   └── ...               # Componentes auxiliares
│   ├── pages/
│   │   ├── Login.tsx         # Tela de acesso
│   │   ├── Dashboard.tsx     # Painel de controle
│   │   ├── Catalogo.tsx      # Catálogo de produtos
│   │   ├── Produtos.tsx      # Gerenciamento de produtos
│   │   ├── Vendas.tsx        # Operação de vendas
│   │   └── Usuarios.tsx      # Gerenciamento de usuários
│   ├── services/
│   │   └── api.ts            # Comunicação com a API e utilitários
│   ├── Styles/
│   │   ├── global.css        # Estilos globais e variáveis
│   │   ├── aurora.css        # Efeitos visuais Aurora
│   │   ├── layout.css        # Layout e navegação
│   │   ├── login.css         # Estilos da tela de login
│   │   ├── produtos.css      # Estilos de produtos
│   │   └── vendas.css        # Estilos de vendas
│   ├── App.tsx               # Composição principal e rotas
│   ├── main.tsx              # Inicialização do React
│   └── index.css             # Importação do Tailwind CSS
├── .env                      # Variáveis locais (criar)
├── package.json              # Dependências e scripts
├── tsconfig*.json            # Configurações TypeScript
└── vite.config.ts            # Configuração do Vite e plugins
Os nomes acima destacam os principais arquivos observados; o projeto pode conter componentes auxiliares adicionais.
Responsabilidades principais
- src/main.tsx: inicializa a aplicação React.
- src/App.tsx: configura as rotas e a composição principal da interface.
- src/services/api.ts: centraliza chamadas HTTP, tipos e utilitários relacionados à sessão e ao carrinho.
- src/components/: componentes reutilizáveis.
- src/pages/: páginas da aplicação.
- src/Styles/: estilos CSS.
- vite.config.ts: configuração do Vite e plugins.
Autenticação e permissões
O código utiliza estas chaves no localStorage:
- ms2_token: token recebido após autenticação.
- ms2_usuario: dados do usuário autenticado em JSON.
- aurora_carrinho: itens mantidos no carrinho local.
As chaves com prefixo ms2 são nomes técnicos internos e não alteram a identidade visual Aurora Vestuário. Os perfis usados pela interface são CAIXA e GERENTE.

O armazenamento local mantém informações entre navegações, mas não é uma fonte confiável de autorização. A validação real deve ocorrer no backend.
Identidade visual
O tema escuro é inspirado no céu noturno e nas auroras boreais, com tons de verde, menta, ciano, azul e violeta. A interface utiliza gradientes, efeitos luminosos, cartões translúcidos, fundo animado com partículas e ajustes de layout para telas menores. O componente FundoAurora implementa o fundo animado em canvas.
Scripts
Comando	Descrição
npm run dev	Inicia o servidor de desenvolvimento
npm run build	Verifica o TypeScript e gera o build
npm run lint	Executa o ESLint
npm run preview	Serve localmente o build gerado


Integração com o backend
Para executar o sistema completo:
1. Configure e inicie o MySQL conforme a documentação do backend.
2. Configure as variáveis de ambiente do backend, incluindo conexão com o banco e segredo de autenticação.
3. Inicie o backend e confirme a URL da API.
4. Ajuste VITE_API_URL neste frontend para apontar para essa API.
5. Execute npm install e npm run dev neste repositório.
Consulte o repositório do backend para instruções de banco de dados, variáveis de ambiente, rotas, autenticação e regras de negócio.
Segurança e observações
- Não publique senhas, tokens reais ou segredos no repositório.
- Variáveis VITE_* são incorporadas ao frontend durante o build; nunca coloque segredos nelas.
- A proteção de rotas no navegador não substitui a autorização no servidor.
- As funcionalidades dependem da compatibilidade entre as rotas do frontend e a versão do backend.