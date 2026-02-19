# Gerenciador MU

Sistema de gestão de usuários com integração Google Sheets e Mercado Pago.

## 🚀 Funcionalidades

- **Multi-usuário**: Conta pai (UsuarioPai) pode gerenciar múltiplos usuários filhos
- **Autenticação**: Login via nome da conta (UsuarioPai)
- **Pagamentos**: Integração com Mercado Pago para assinaturas de planos
- **Dashboard**: Painel completo com gestão de usuários, pagamentos e histórico
- **Busca e Paginação**: Interface otimizada com busca e paginação (10 itens/página)
- **Google Sheets**: Armazenamento de dados em planilhas Google

## 🛠️ Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Google Sheets API
- **Pagamentos**: Mercado Pago SDK
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+
- Conta Google Cloud (para Google Sheets API)
- Conta Mercado Pago (para pagamentos)

## 🚀 Setup Local

1. Clone o repositório:
```bash
git clone https://github.com/AutomatosData/gerenciadormu.git
cd gerenciadormu
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Google Sheets:
   - Crie um projeto no Google Cloud Console
   - Habilite a Google Sheets API
   - Crie uma Service Account
   - Baixe o arquivo `credentials.json`
   - Compartilhe sua planilha com o email da Service Account

4. Configure o Mercado Pago:
   - Crie uma conta no Mercado Pago
   - Obtenha as chaves de API (sandbox ou produção)

5. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

6. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🌐 Deploy no Vercel

1. Configure as variáveis de ambiente no Vercel:
   - `GOOGLE_SHEETS_ID`: ID da sua planilha
   - `GOOGLE_CREDENTIALS`: JSON completo das credenciais (copie todo o conteúdo do `credentials.json`)
   - `MP_PUBLIC_KEY`: Chave pública do Mercado Pago
   - `MP_ACCESS_TOKEN`: Token de acesso do Mercado Pago
   - `MP_WEBHOOK_SECRET`: Segredo do webhook

2. **Importante**: Para o `GOOGLE_CREDENTIALS`, copie todo o JSON do arquivo `credentials.json` e cole como uma única linha, sem aspas extras.

3. Conecte seu repositório ao Vercel e faça o deploy

## 📁 Estrutura

```
src/
├── app/                 # Páginas Next.js
│   ├── api/            # API Routes
│   ├── login/          # Página de login
│   ├── cadastro/       # Página de cadastro
│   ├── painel/         # Dashboard
│   └── pagamento/      # Página de pagamento
├── components/         # Componentes React
├── context/           # Context API (autenticação)
└── lib/               # Utilitários (Google Sheets, Mercado Pago)
```

## 🔐 Modelo de Dados

### Google Sheets

**USUÁRIOS** (colunas A-H):
- ID, Nome, Usuario, E-mail, Plano, Expira, WhatsApp, UsuarioPai

**PAGAMENTOS**:
- ID Usuário, ID Pagamento, Data Pagamento, Valor, Método

**Histórico**:
- Horário, Usuario, IP, MAC

### Fluxo de Autenticação

1. **Cadastro**: Cria conta pai (UsuarioPai)
2. **Login**: Autentica pelo UsuarioPai
3. **Gestão**: Pai cria e gerencia usuários filhos
4. **Pagamentos**: Pai seleciona usuário filho para assinar plano

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT.
