# Documentação Completa - Controle de Empréstimos

## 📖 Índice
1. [Visão Geral](#visão-geral)
2. [Instalação e Execução](#instalação-e-execução)
3. [Interface do Usuário](#interface-do-usuário)
4. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [Guia de Uso](#guia-de-uso)
7. [Dados e Persistência](#dados-e-persistência)

---

## Visão Geral

O **Controle de Empréstimos** é uma aplicação desktop desenvolvida com **Electron** que permite gerenciar empréstimos de itens pessoais. É ideal para quem empresta livros, jogos, filmes, equipamentos ou outros objetos com frequência.

### Principais Características
- ✅ Interface limpa e intuitiva
- ✅ Três abas bem organizadas (Registrar, Empréstimos, Configurações)
- ✅ Filtros avançados para busca rápida
- ✅ Agrupamento alfabético automático
- ✅ Tema claro/escuro
- ✅ Exportação em PDF
- ✅ Dados persistidos localmente

---

## Instalação e Execução

### Pré-requisitos
- Node.js 16.x ou superior
- npm ou yarn

### Passos

1. **Clone ou acesse o projeto**
```bash
cd Controle-de-Empr-stimos-simples
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie a aplicação**
```bash
npm start
```

A aplicação abrirá em uma janela desktop do Electron.

---

## Interface do Usuário

### Layout Geral

```
┌─────────────────────────────────────────────────────────┐
│  Controle de Empréstimos                    Abas        │
│  Gerencie livros, jogos e objetos...   [Reg][Emp][Conf]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│              Conteúdo da Aba Selecionada               │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Componentes Principais

#### Header (Cabeçalho)
- **Título e descrição**: "Controle de Empréstimos" com descrição
- **Botões de navegação**: Três abas para diferentes funcionalidades

#### Tema
- Toda a interface responde ao tema selecionado (claro/escuro)
- As cores ajustam-se automaticamente para melhor legibilidade

---

## Funcionalidades Detalhadas

### 1️⃣ ABA "REGISTRAR"

**Objetivo**: Registrar um novo empréstimo

#### Campos do Formulário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| **Tipo do item** | Select | ✅ Sim | Livro, Jogo, Filme, Equipamento, Outro |
| **Item emprestado** | Texto | ✅ Sim | Nome do item (ex: "1984", "PlayStation 5") |
| **Nome da pessoa** | Texto | ✅ Sim | Nome de quem pegou emprestado |
| **Telefone** | Texto | ❌ Não | Contato opcional da pessoa emprestada |
| **Data de nascimento** | Data | ❌ Não | Ajuda a identificar o registro quando necessário |
| **CEP** | Texto | ✅ Sim | Campo obrigatório com máscara/números e validação no formato 00000-000; dispara busca no ViaCEP para sugerir o logradouro e o bairro |
| **Endereço** | Texto | ✅ Sim | Localização obrigatória para registro completo |
| **Bairro** | Texto | ❌ Não | Preenchido automaticamente pela consulta ao CEP, mas pode ser editado manualmente |
| **Número** | Texto | ❌ Não | Número do imóvel; insira manualmente para completar o endereço |
| **Data do empréstimo** | Data | ❌ Não | Se não preenchida, usa a data atual |
| **Código do item** | Texto | ❌ Não | Gerado automaticamente, somente leitura |

#### Como Funciona

1. Preencha os campos obrigatórios
2. O código é gerado automaticamente quando você seleciona o tipo
2.1. Se já houver registro ativo para o mesmo item e pessoa, aparece um alerta; confirmar continua registrando o novo empréstimo e o relaciona ao cadastro anterior.
2.1. Após informar um CEP válido o app consulta o ViaCEP para sugerir logradouro e bairro; confirme ou ajuste o resultado antes de continuar
3. Clique em "Registrar empréstimo"
4. O empréstimo é salvo e a lista é atualizada
5. Os campos são limpos para o próximo registro

#### Exemplos de Registro

```
Tipo: Livro
Item: O Senhor dos Anéis
Pessoa: Maria
CEP: 01001-000
Endereço: Rua das Flores, 220
Data: 15/12/2025
Código: LIV-4829-A7K2
```

```
Tipo: Equipamento
Item: Projetor LG
Pessoa: João
CEP: 20020-050
Endereço: Rua Central, 500
Data: (deixar vazio = 16/12/2025)
Código: EQU-5104-M9X1
```

---

### 2️⃣ ABA "EMPRÉSTIMOS"

**Objetivo**: Visualizar, filtrar e gerenciar empréstimos

#### Painel de Filtros

Localizado no topo da aba, permite filtrar a lista de empréstimos em tempo real.

##### Filtro 1: Status
```
○ Todos        (mostra todos os empréstimos)
○ Pendentes    (mostra apenas não devolvidos)
○ Devolvidos   (mostra apenas devolvidos)
```

##### Filtro 2: Tipo de Item
```
Dropdown com opções:
- Todos os tipos
- Livro
- Jogo
- Filme
- Equipamento
- Outro
```

##### Filtro 3: Pessoa
```
Campo de texto para buscar por nome
(busca em tempo real, case-insensitive)
```

#### Exemplos de Uso dos Filtros

**Cenário 1**: Ver apenas livros pendentes
- Status: Pendentes
- Tipo: Livro
- Pessoa: (deixar vazio)

**Cenário 2**: Ver tudo que emprestei para Maria
- Status: Todos
- Tipo: Todos os tipos
- Pessoa: Maria

**Cenário 3**: Ver equipamentos devolvidos
- Status: Devolvidos
- Tipo: Equipamento
- Pessoa: (deixar vazio)

#### Visualização da Lista

A lista é organizada em **SEÇÕES ALFABÉTICAS**:

```
A
├── Apple TV (Equipamento)
│   Joaquim · Equipamento · emprestado em 14 dez
│   Registrado em 14 dez
│   Codigo: EQU-1234-X5Y8
│   [Marcar como devolvido]
│
└── Aventura de Didi (Jogo)
    Pedro · Jogo · emprestado em 15 dez
    Registrado em 15 dez
    Codigo: JOG-2345-K3L9
    Devolvido em 16 dez

C
├── Código da Vinci (Livro)
    Maria · Livro · emprestado em 10 dez
    Registrado em 10 dez
    Codigo: LIV-3456-M2N7
    [Marcar como devolvido]

...
```

#### Ações na Lista

**Para itens pendentes:**
- Clique em "Marcar como devolvido"
- Abrirá um modal com seletor de data
- Selecione a data (padrão: hoje)
- Confirme
- Item muda para status "Devolvido"

**Para itens devolvidos:**
- Exibe apenas a data de devolução
- Sem botão de ação

#### Barra de Status

```
Itens pendentes: 5 | Exibindo 3 itens | [Limpar histórico] [Exportar PDF]
```

- **Itens pendentes**: Contador total de não devolvidos
- **Exibindo**: Quantidade de itens visíveis com os filtros aplicados
- **Limpar histórico**: Remove TODOS os registros (com confirmação)
- **Exportar PDF**: Gera PDF da lista atual

---

### 3️⃣ ABA "CONFIGURAÇÕES"

**Objetivo**: Ajustar preferências da aplicação

#### Opções Disponíveis

1. **Modo Claro/Escuro**
   - Botão alterna entre os dois temas
   - Preferência é salva automaticamente
   - Afeta toda a interface

---

## Arquitetura Técnica

### Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| **Framework Desktop** | Electron |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Storage** | JSON (userData do Electron) |
| **Build** | Webpack (padrão Electron) |

### Estrutura de Arquivos

```
Controle-de-Empr-stimos-simples/
├── main.js              # Processo principal Electron
├── preload.js           # Bridge de segurança
├── package.json         # Metadados e dependências
├── README.md            # Guia rápido
├── DOCUMENTACAO.md      # Este arquivo
└── src/
    ├── index.html       # HTML da interface
    ├── renderer.js      # Lógica JavaScript (DOM, eventos)
    └── style.css        # Estilos CSS
```

### Fluxo de Dados

```
┌──────────────────────────────────────────┐
│         main.js (Processo Principal)     │
│    - Gerencia janela Electron            │
│    - IPC com renderer                    │
│    - Acesso ao sistema de arquivos       │
└──────────────────────────────────────────┘
                    ↓ IPC
┌──────────────────────────────────────────┐
│      preload.js (Context Bridge)         │
│    - Expõe loanAPI de forma segura      │
└──────────────────────────────────────────┘
                    ↓ window.loanAPI
┌──────────────────────────────────────────┐
│   renderer.js (Processo de Renderização) │
│    - Manipula DOM                        │
│    - Ouve eventos de usuario             │
│    - Chama funções via loanAPI           │
└──────────────────────────────────────────┘
                    ↓ DOM Update
┌──────────────────────────────────────────┐
│       index.html (Renderizado)           │
│    - Exibe interface ao usuário          │
└──────────────────────────────────────────┘
```

### Principais Funções (renderer.js)

```javascript
// Formatação
formatDate(value)           // Formata data no padrão BR
generateProductCode(type)   // Gera código único do item

// Renderização
renderLoans(loans)          // Renderiza lista com seções alfabéticas
refreshLoans(filter)        // Atualiza lista e aplica filtros
switchView(viewId)          // Troca entre abas

// Formulário
handleFormSubmit(event)     // Processa novo empréstimo
handleClear()              // Limpa histórico com confirmação

// Filtros
statusFilter               // Controla filtro por status
typeFilter                 // Controla filtro por tipo
borrowerFilter             // Controla filtro por pessoa

// Modal
returnModal                // Abre/fecha modal de devolução
```

---

## Guia de Uso

### Caso de Uso 1: Registrar um Empréstimo

1. Na aba "Registrar", preencha:
  - Tipo: "Livro"
  - Item: "Clean Code"
  - Pessoa: "Paulo"
   - CEP: 01001-000 (formato 00000-000 com máscara ativa; o sistema buscará o endereço automaticamente)
   - Endereço: Rua das Flores, 220
   - Bairro: Jardim das Flores (ajuste se necessário)
   - Número: 220
   - Telefone: (11) 98877-6655 (opcional)
  - Ao digitar um telefone que já existe na base, o sistema preenche o nome, endereço, bairro e número automaticamente e exibe um alerta sobre os itens vinculados a esse contato.
   - Data de nascimento: 17/03/1992 (opcional)
   - Data: 16/12/2025

2. Clique em "Registrar empréstimo"

3. O item aparecerá na aba "Empréstimos" sob a letra "C" (Clean Code)
  - CEP: 20020-050
  - Endereço: Rua Central, 500
  - Bairro: Centro
  - Número: 500
  - Botão “Enviar mensagem” copia um lembrete em português para ser colado no WhatsApp/Telegram (visível quando há telefone registrado)

### Caso de Uso 2: Marcar Devolução com Data Específica

1. Na aba "Empréstimos", localize o item pendente

2. Clique em "Marcar como devolvido"

3. No modal que abre:
   - Altere a data se necessário
   - Clique em "Confirmar"

4. Item muda para status "Devolvido" e exibe a data

### Caso de Uso 3: Filtrar Empréstimos de Uma Pessoa

1. Na aba "Empréstimos"

2. No painel de filtros, campos "Pessoa"

3. Digite o nome ou telefone (ex: "Maria" ou "988776655")

4. A lista atualiza em tempo real mostrando apenas empréstimos para Maria

### Caso de Uso 4: Exportar Relatório em PDF

1. Na aba "Empréstimos"

2. Aplique os filtros desejados (opcional)

3. Clique em "Exportar PDF"

4. Um PDF será gerado com a lista visível

5. Salve no local desejado

6. O PDF mantém telefone, data de nascimento, endereço, bairro, número e CEP do tomador exibidos na lista

### Caso de Uso 5: Alternar Tema

1. Na aba "Configurações"

2. Clique em "Modo escuro" ou "Modo claro"

3. Toda a interface muda de tema instantaneamente

4. Preferência é salva automaticamente

---

## Dados e Persistência

### Formato dos Dados

Os dados são armazenados em JSON no seguinte formato:

```javascript
{
  "loans": [
    {
      "id": "1234567890",           // Timestamp único
      "item": "1984",               // Nome do item
      "borrower": "Maria",          // Quem pegou emprestado
      "type": "Livro",              // Tipo do item
      "loanDate": "2025-12-15",     // Data empréstimo (ISO)
      "createdAt": "2025-12-15",    // Data criação (ISO)
      "borrowerPhone": "(11) 91234-5678", // Contato opcional
      "borrowerBirthdate": "1990-05-09",  // Data de nascimento (ISO)
      "borrowerAddress": "Rua das Flores, 220",
      "borrowerCep": "01001-000",
      "borrowerNeighborhood": "Centro",
      "borrowerNumber": "220",
      "relatedLoanId": "1234500000",
      "relatedProductCode": "LIV-9876-Z9A2",
      "productCode": "LIV-1234-A5X2", // Código gerado
      "returned": false,            // Status
      "returnedAt": null            // Data devolução (ISO ou null)
    },
    {
      "id": "1234567891",
      "item": "PlayStation 5",
      "borrower": "João",
      "type": "Equipamento",
      "loanDate": "2025-12-10",
      "createdAt": "2025-12-10",
      "borrowerPhone": "(21) 99876-5432",
      "borrowerBirthdate": "1986-04-02",
      "borrowerAddress": "Rua Central, 500",
      "borrowerCep": "20020-050",
      "productCode": "EQU-5104-K8M1",
      "returned": true,
      "returnedAt": "2025-12-16"
    }
  ],
  "theme": "light"  // ou "dark"
}
```

### Localização do Arquivo

**Windows:**
```
C:\Users\[SEU_USUARIO]\AppData\Local\Controle-de-Emprésimos\userData\store.json
```

**macOS:**
```
~/Library/Application Support/Controle-de-Empréstimos/userData/store.json
```

**Linux:**
```
~/.config/Controle-de-Empréstimos/userData/store.json
```

### Backup e Recuperação

Para fazer backup dos seus dados:
1. Localize o arquivo `store.json` (veja acima)
2. Copie-o para um local seguro
3. Para restaurar, sobrescreva o arquivo original com a cópia

---

## Recursos Avançados

### Código Gerado Automaticamente

O código tem o formato: `[TIPO]-[TIMESTAMP]-[RANDOM]`

Exemplo: `LIV-4829-A7K2`
- **LIV**: Primeiras 3 letras do tipo (Livro → LIV)
- **4829**: Últimos 4 dígitos do timestamp
- **A7K2**: Caracteres aleatórios para unicidade

### Ordenação Alfabética

Os itens são automaticamente:
1. Agrupados por primeira letra
2. Ordenados alfabeticamente dentro do grupo
3. Suporta caracteres especiais do português (ç, ã, etc.)

### Filtros em Tempo Real

Os filtros aplicam-se instantaneamente ao digitar/selecionar:
- Sem necessidade de apertar botão "Buscar"
- Combináveis entre si
- Contadores atualizados em tempo real

---

## Dúvidas Frequentes

**P: Como faço backup dos dados?**
R: Localize o arquivo `store.json` na pasta `userData` e faça uma cópia.

**P: Posso editar um empréstimo após registrar?**
R: Atualmente, você precisa marcar como devolvido e registrar novamente. Uma feature de edição pode ser adicionada futuramente.

**P: Os dados são sincronizados entre dispositivos?**
R: Não, os dados são armazenados localmente no seu computador.

---

## Integração SMS (Twilio)

1. Crie uma conta gratuita no Twilio e guarde o `Account SID`, `Auth Token` e um número de telefone autorizado (o número enviado pela Twilio).
2. No diretório `backend/` (fora deste projeto) construa o servidor Express com o endpoint abaixo:
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
3. Configure `.env` com `TWILIO_SID`, `TWILIO_TOKEN` e `TWILIO_PHONE`, rode `node index.js` e deixe `backend` escutando a porta 3000 (ou outra porta e defina `SMS_BACKEND_URL`).
4. No Electron, o botão “Enviar mensagem” chama o backend via o canal seguro `window.loanAPI.sendSms`; o texto é enviado direto ao Twilio, e a UI alerta se houver falha (copiando o texto para envio manual).

**P: Posso usar o app em modo offline?**
R: Sim, o app funciona completamente offline.

**P: Qual é o limite de empréstimos?**
R: Não há limite prático. O performance depende apenas do seu computador.

---

## Troubleshooting

### App não inicia
```bash
# Limpe os módulos e reinstale
rm -rf node_modules
npm install
npm start
```

### Dados desaparecem após reiniciar
- Verifique a localização do arquivo `store.json`
- Certifique-se que você tem permissões de escrita no diretório

### Modal de devolução não abre
- Recarregue a aplicação
- Se o problema persistir, verifique console (F12)

---

## Contato e Suporte

Para dúvidas ou sugestões sobre este projeto, consulte a documentação ou entre em contato com o desenvolvedor.

**Versão**: 2.0  
**Data**: Dezembro 2025  
**Status**: Funcional e estável

