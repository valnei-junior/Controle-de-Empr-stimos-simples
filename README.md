# Controle de Empréstimos (Electron)

Aplicativo desktop leve feito com Electron para registrar, monitorar e organizar empréstimos de livros, jogos, filmes, equipamentos e outros objetos de uso pessoal. A interface combina abas, filtros em tempo real e persistência local para centralizar o histórico de devoluções.

## Visão geral

- Registro rápido de empréstimos com tipo de item, tomador, data e código gerado automaticamente.
- Lista cronológica com estados pendente/devolvido e filtros combináveis por status, tipo e pessoa.
- Tema claro/escuro persistente, exportação em PDF e limpeza total do histórico.

## Recursos principais

- Formulário acessível com validações de campos obrigatórios (nome, item, endereço e CEP) e máscara para CEP no formato 00000-000.
O sistema alerta quando já existe um empréstimo com o mesmo item e tomador e permite vincular o novo registro ao cadastro existente.
O campo CEP dispara busca no ViaCEP para preencher endereço e bairro automaticamente.
Ao digitar um telefone já registrado, os dados do tomador são preenchidos automaticamente e aparece um alerta indicando os itens vinculados a esse contato.
A aba “Empréstimos” oferece um botão “Enviar mensagem” que envia um lembrete em português via serviço Twilio (ou cai no fallback de copiar o texto quando o backend estiver indisponível).
- Geração automática de `productCode` com base no tipo selecionado.
- Reset visual imediato após o envio para focar no próximo empréstimo.

## Integração SMS (Twilio)

    ```js
    app.post('/send-sms', async (req, res) => {
        const { to, message } = req.body;
        const sms = await client.messages.create({
            from: process.env.TWILIO_PHONE,
            to,
            body: message,
        });
        res.json({ success: true, sid: sms.sid });
    });
    ```

### Backend incluso

Este repositório já inclui uma pasta `backend/` com o servidor Express/Twilio e um `.env.example`. Para começar:

1. Abra `backend/.env.example`, copie como `.env` e preencha `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_PHONE` e `PORT` se quiser alterar.
2. Rode `npm install` dentro de `backend/` e depois `npm start` para deixar o backend escutando (por padrão porta 3000).
3. O Electron se comunica com esse serviço pelo `SMS_BACKEND_URL` (defaults para `http://localhost:3000`), então mantenha o backend ativo enquanto enviar mensagens.

Com isso, o botão “Enviar mensagem” dispara SMS em português diretamente pelo Twilio.

- Coleta opcional de telefone e data de nascimento do tomador.
- Exportação em PDF (`window.loanAPI.exportPdf`) preserva telefone, data de nascimento, endereço e CEP do tomador listado.
- Novos campos `bairro` e `número` garantem a localização completa do tomador.

### 📊 Aba "Empréstimos"
- Renderização dinâmica de cada empréstimo com badge de status, detalhes, datas e código.
- Modal para marcar como devolvido com data customizável.
- Contador em tempo real de itens pendentes e descrição da lista filtrada.

### ⚙️ Aba "Configurações"
- Alternância entre modo claro e escuro via `window.loanAPI.setTheme`.
- Ajustes visuais para exportação (lista única) utilizados antes de gerar o PDF.

### 📤 Extras
- Exportação em PDF (`window.loanAPI.exportPdf`) com feedback visual durante a operação.
- Limpeza completa do histórico após confirmação explícita.
- Pesquisa instantânea por nome ou telefone do tomador.

## Fluxo do renderer.js

O `renderer.js` administra o estado visual, aplica filtros e aciona a `loanAPI` exposta pelo `preload.js`. As funções principais são:

1. `applyTheme`, `formatDate`, `generateProductCode` e `refreshProductCode` cuidam da apresentação imediata de temas, datas e códigos.
2. `renderLoans` limpa o DOM e cria os cartões de empréstimo com ações de devolução.
3. `applyFilters`, `refreshLoans`, `handleFormSubmit` e `handleClear` sincronizam a interface com a store e garantem que a tela reflita os dados persistidos.

## API exposta em window.loanAPI

- `loadStore()` – retorna o objeto persistido com `loans`, `theme` e outras chaves.
- `addLoan(payload)` – registra um novo empréstimo com `{ item, borrower, loanDate, type, productCode }`.
- `markReturned(id)` – marca o empréstimo como devolvido e registra `returnedAt`.
- `clearHistory()` – remove todos os registros (usado após confirmação do usuário).
- `setTheme(theme)` – persiste a preferência e responde com o estado final.
- `exportPdf()` – dispara o fluxo de exportação e retorna uma mensagem com o resultado.

## Execução e desenvolvimento

```bash
npm install
npm start
```

Para builds de produção, use `npm run make` (ou o script definido no Electron Forge/Empacotador escolhido).

## Estrutura do projeto

```
├── main.js                 # Processo principal (Electron)
├── preload.js              # Canal seguro entre renderer e Node
├── package.json            # Dependências, scripts e metadata
└── src/
    ├── index.html          # Layout principal com abas e modais
    ├── renderer.js         # Lógica da UI e manipulação da loanAPI
    ├── style.css           # Estilos responsivos e temas
    └── assets/             # Ícones, fontes e imagens complementares (quando houver)
```

## Dados persistidos

A store salva JSON no diretório `userData` do Electron (ex.: `%APPDATA%\/Controle de Empréstimos`). Cada objeto dentro de `loans` registra o item, tomador, datas, `productCode`, `borrowerAddress`, `borrowerNeighborhood`, `borrowerNumber`, `borrowerCep`, e, quando o novo empréstimo está vinculado a um cadastro pré-existente, também guarda `relatedLoanId` e `relatedProductCode`.

## Como contribuir

1. Crie uma branch a partir de `main`.
2. Escreva código testável com comentários e documentação consistentes com `renderer.js`.
3. Rode `npm test` ou `npm run lint` quando aplicável.
4. Abra um pull request explicando claramente o impacto e os testes executados.

