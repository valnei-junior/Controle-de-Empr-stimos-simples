# Controle de Empréstimos (Electron)

Aplicativo desktop construído com Electron para registrar, monitorar e gerenciar empréstimos de livros, jogos, filmes, equipamentos e outros objetos. Com modo claro/escuro, filtros avançados, agrupamento alfabético e seleção de data de devolução.

## Funcionalidades

### 📝 Aba "Registrar"
- Registrar novo empréstimo com:
  - Tipo de item (Livro, Jogo, Filme, Equipamento, Outro)
  - Nome do item emprestado
  - Nome da pessoa que pegou emprestado
  - Data do empréstimo
  - Código automático do item gerado
- Formulário limpo e intuitivo
- Validação de campos obrigatórios

### 📊 Aba "Empréstimos"
- **Visualização em Seções Alfabéticas**: Lista organizada por primeira letra do item (A, B, C, etc.)
- **Filtros Avançados**:
  - **Status**: Todos, Pendentes, Devolvidos
  - **Tipo de Item**: Filtrar por tipo específico
  - **Pessoa**: Buscar empréstimos por nome
  - Os filtros funcionam em tempo real e podem ser combinados
- **Informações do Item**:
  - Nome e tipo do item
  - Pessoa que pegou emprestado
  - Data do empréstimo
  - Data de registro
  - Código identificador único
- **Ações**:
  - Marcar como devolvido com data customizável
  - Modal para selecionar data específica da devolução
  - Exibição de data de devolução

### ⚙️ Aba "Configurações"
- Alternar entre modo claro e escuro
- Preferências persistentes

### 📤 Recursos Adicionais
- Exportar lista em PDF
- Limpar histórico (com confirmação)
- Contador de itens pendentes
- Pesquisa dinâmica

## Execução

```bash
npm install
npm start
```

## Estrutura do Projeto

```
├── main.js                 # Processo principal (Electron)
├── preload.js             # Acesso seguro à API
├── package.json           # Dependências
└── src/
    ├── index.html         # Interface
    ├── renderer.js        # Lógica da aplicação
    └── style.css          # Estilos
```

## Dados Persistidos

Os registros são salvos em JSON dentro do diretório `userData` da aplicação (AppData/Local no Windows), incluindo:
- Lista completa de empréstimos
- Tema preferido (claro/escuro)
- Histórico de devoluções
