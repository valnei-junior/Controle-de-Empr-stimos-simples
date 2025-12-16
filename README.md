# Controle de Empréstimos (Electron)

Aplicativo desktop construído com Electron para registrar e monitorar empréstimos de livros, jogos ou objetos pessoais. Possui modo claro/escuro, menu dedicado para ações rápidas e persistência simples dos dados no `userData`.

## Funcionalidades

- Registrar item, nome do empréstimo e data
- Marcar itens como devolvidos
- Visualizar itens pendentes e históricos com filtros
- Limpar todo o histórico de empréstimos
- Alternar entre modo claro e escuro
- Menu com comandos para novo empréstimo, pendentes e limpar histórico

## Execução

```bash
npm install
npm start
```

Os registros são salvos em um JSON dentro do diretório `userData` da aplicação.
