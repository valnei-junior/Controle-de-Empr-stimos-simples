const form = document.getElementById('loan-form');
const loanList = document.getElementById('loan-list');
const pendingCountEl = document.getElementById('pending-count');
const clearButton = document.getElementById('clear-button');
const themeToggle = document.getElementById('theme-toggle');
const filterLabel = document.getElementById('filter-label');
const itemField = document.getElementById('item-name');
const itemTypeField = document.getElementById('item-type');
const borrowerField = document.getElementById('borrower-name');
const dateField = document.getElementById('loan-date');
const productCodeField = document.getElementById('product-code');
const tabButtons = document.querySelectorAll('[data-view]');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const exportButton = document.getElementById('export-button');
const returnModal = document.getElementById('return-modal');
const returnDateInput = document.getElementById('return-date');
const returnCancelBtn = document.getElementById('return-cancel');
const returnConfirmBtn = document.getElementById('return-confirm');
const statusFilterInputs = document.querySelectorAll('input[name="status-filter"]');
const typeFilterSelect = document.getElementById('type-filter');
const borrowerFilterInput = document.getElementById('borrower-filter');

let currentFilter = 'all';
let currentTheme = 'light';
let pendingReturnId = null;
let statusFilter = 'all';
let typeFilter = '';
let borrowerFilter = '';

/**
 * Aplica o tema (claro/escuro) à interface
 * @param {string} theme - 'light' ou 'dark'
 * Atualiza: variável global, atributo data-theme do body e texto do botão
 */
const applyTheme = (theme) => {
  currentTheme = theme;
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
};

/**
 * Formata datas no padrão brasileiro (ex: "15 dez 2025")
 * @param {string|Date} value - Data em ISO ou objeto Date
 * @returns {string} Data formatada ou '-' se vazio
 */
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Gera código único e legível para cada item (XXX-NNNN-AAAA)
 * @param {string} type - Tipo do item (Livro, Jogo, etc)
 * @returns {string} Código gerado, ex: LIV-4829-A7K2
 * Composição: [3 letras tipo]-[4 últimos dígitos timestamp]-[4 caracteres aleatórios]
 */
const generateProductCode = (type) => {
  const prefix = (type || 'ITEM').slice(0, 3).toUpperCase();
/**
 * Regenera o código do produto quando o tipo muda
 * - Dispara automaticamente quando usuário seleciona novo tipo
 * - Garante que cada item tenha código único
 */
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const refreshProductCode = () => {
 **
 * Renderiza lista de empréstimos com agrupamento alfabético por seção
 * @param {Array} loans - Array de empréstimos a exibir
 * Processo:
 *   1. Agrupa por primeira letra do item
 *   2. Ordena seções (A-Z)
 *   3. Dentro de cada seção, ordena itens alfabeticamente
 *   4. Cria header (A, B, C, etc) para cada seção
 *   5. Renderiza cada empréstimo com: dados, status e ações
 *   6. Mostra placeholder se lista vazia
 */
    productCodeField.value = generateProductCode(itemTypeField?.value);
  }
};

// Refaz a lista de empréstimos agrupada por seção alfabética.
const renderLoans = (loans) => {
  loanList.innerHTML = '';
  if (!loans.length) {
    const placeholder = document.createElement('li');
    placeholder.className = 'empty';
    placeholder.textContent = 'Nenhum empréstimo registrado.';
    loanList.appendChild(placeholder);
    return;
  }

  // Agrupa os empréstimos por primeira letra do item
  const grouped = {};
  loans.forEach((loan) => {
    const firstLetter = (loan.item?.charAt(0) || '?').toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(loan);
  });

  // Ordena as seções alfabeticamente
  const sections = Object.keys(grouped).sort();

  sections.forEach((section) => {
    // Cria a seção com a letra
    const sectionHeader = document.createElement('li');
    sectionHeader.className = 'section-header';
    sectionHeader.textContent = section;
    loanList.appendChild(sectionHeader);

    // Ordena os empréstimos dentro da seção alfabeticamente
    const sectionLoans = grouped[section].sort((a, b) => 
      a.item.localeCompare(b.item, 'pt-BR')
    );

    sectionLoans.forEach((loan) => {
      const li = document.createElement('li');
      li.className = loan.returned ? 'loan returned' : 'loan pending';

      const header = document.createElement('div');
      header.className = 'loan-header';
      header.innerHTML = `
        <div>
          <strong>${loan.item}</strong>
          <p class="muted small">${loan.type || 'Item'}</p>
        </div>
        <span>${loan.returned ? 'Devolvido' : 'Pendente'}</span>
      `;

      const details = document.createElement('div');
      details.className = 'loan-details';
      details.innerHTML = `
        <p>${loan.borrower} · ${loan.type || 'Item'} · emprestado em ${formatDate(loan.loanDate)}</p>
        <p class="muted">Registrado em ${formatDate(loan.createdAt)}</p>
        <p class="muted">Codigo: ${loan.productCode || '-'}</p>
      `;

      li.appendChild(header);
      li.appendChild(details);

      if (!loan.returned) {
        const action = document.createElement('button');
        action.textContent = 'Marcar como devolvido';
        action.addEventListener('click', () => {
          pendingReturnId = loan.id;
          returnDateInput.value = new Date().toISOString().split('T')[0];
 **
 * Carrega dados do Electron, aplica filtros e renderiza lista
 * @param {string} filter - Tipo de filtro (usado para menu)
 * Filtros aplicados sequencialmente:
 *   - Status (all/pending/returned)
 *   - Tipo de item (se selecionado)
 *   - Nome pessoa (busca case-insensitive)
 * Atualiza: renderização, contador pendentes, label e tema
 */
        });
        li.appendChild(action);
      } else if (loan.returnedAt) {
        const returnedAt = document.createElement('p');
        returnedAt.className = 'muted small';
        returnedAt.textContent = `Devolvido em ${formatDate(loan.returnedAt)}`;
        li.appendChild(returnedAt);
      }

      loanList.appendChild(li);
    });
  });
};

// Puxa os dados do Electron e atualiza o filtro e a lista.
const refreshLoans = async (filter = 'all') => {
  const store = await window.loanAPI.loadStore();
  let loans = store.loans || [];
  
  // Aplica filtros
  let visibleLoans = loans;
  
  // Filtro por status
  if (statusFilter === 'pending') {
    visibleLoans = visibleLoans.filter((loan) => !loan.returned);
  } else if (statusFilter === 'returned') {
    visibleLoans = visibleLoans.filter((loan) => loan.returned);
  }
  
  // Filtro por tipo
  if (typeFilter) {
 **
 * Processa submissão do formulário de novo empréstimo
 * @param {Event} event - Evento submit do formulário
 * Validações: item e pessoa obrigatórios
 * Ações:
 *   1. Coleta dados do formulário
 *   2. Valida campos
 *   3. Gera código do item
 *   4. Envia para API Electron
 *   5. Limpa formulário
 *   6. Atualiza lista exibida
 */n.type === typeFilter);
  }
  
  // Filtro por pessoa (case-insensitive)
  if (borrowerFilter) {
    visibleLoans = visibleLoans.filter((loan) => 
      loan.borrower.toLowerCase().includes(borrowerFilter.toLowerCase())
    );
  }
  
  renderLoans(visibleLoans);
  const pendingCount = loans.filter((loan) => !loan.returned).length;
  pendingCountEl.textContent = pendingCount;
  filterLabel.textContent = `${visibleLoans.length} item(ns)`;
  applyTheme(store.theme || 'light');
  currentFilter = filter;
};

// Controla o envio do formulário e limpa os campos.
const handleFormSubmit = async (event) => {
  event.preventDefault();
 **
 * Limpa todo o histórico de empréstimos com confirmação
 * - Mostra dialog confirmando ação
 * - Se ok: deleta todos registros via API e recarrega lista
 * - Se cancelar: não faz nada
 */tem';
  const productCode = productCodeField?.value || generateProductCode(type);
  const payload = {
    item: itemField.value.trim(),
    borrower: borrowerField.value.trim(),
    loanDate: dateField.value || new Date().toISOString(),
 **
 * Alterna entre as três abas (Registrar, Empréstimos, Configurações)
 * @param {string} viewId - ID da aba: 'register', 'overview' ou 'settings'
 * Ações:
 *   - Oculta todos os painéis
 *   - Mostra apenas painel selecionado
 *   - Remove 'active' de botões
 *   - Adiciona 'active' ao botão clicado
 */
    productCode,
  };
  if (!payload.item || !payload.borrower) {
    return;
  }
  await window.loanAPI.addLoan(payload);
  form.reset();
  dateField.value = '';
  refreshProductCode();
  refreshLoans(currentFilter);
};

// Pede confirmação antes de apagar tudo.
const handleClear = async () => {
  const confirmed = window.confirm('Isso irá apagar todo o histórico de empréstimos. Deseja continuar?');
  if (!confirmed) return;
  await window.loanAPI.clearHistory();
  refreshLoans('all');
};

form.addEventListener('submit', handleFormSubmit);
clearButton.addEventListener('click', handleClear);

/**
 * Prepara interface para exportação em PDF
 * - Oculta: header, formulário, filtros, botões
 * - Mantém: apenas lista de empréstimos
 * - Aguarda reflow para aplicar estilos
 * @returns {Promise} Resolvida quando mudanças aplicadas
 */
const enableExportMode = () => {
  document.body.dataset.exporting = 'list-only';
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
};

/**
 * Retorna interface ao estado normal após exportação
 * - Remove atributo data-exporting do body
 * - Reativa CSS normal (exibe header, formulário, etc)
 */tton.dataset.view === viewId);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

if (itemTypeField) {
  itemTypeField.addEventListener('change', refreshProductCode);
}

themeToggle.addEventListener('click', async () => {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  await window.loanAPI.setTheme(next);
  applyTheme(next);
});

// Esconde tudo menos a lista para o PDF mostrar só os itens.
const enableExportMode = () => {
  document.body.dataset.exporting = 'list-only';
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
};

// Volta a tela ao normal depois do PDF.
const disableExportMode = () => {
 **
 * Event listeners para os filtros de status
 * - Permite escolher: Todos, Pendentes, Devolvidos
 * - Atualiza lista em tempo real
 */
statusFilterInputs.forEach((input) => {
  input.addEventListener('change', () => {
    statusFilter = input.value;
    refreshLoans(currentFilter);
  });
});

/**
 * Event listener para filtro de tipo de item
 * - Filtra por tipo (Livro, Jogo, Filme, etc)
 * - Atualiza lista em tempo real
 */
typeFilterSelect.addEventListener('change', () => {
  typeFilter = typeFilterSelect.value;
  refreshLoans(currentFilter);
});

/**
 * Event listener para filtro de pessoa
 * - Busca case-insensitive no nome do tomador
 * - Atualiza lista em tempo real
 */
borrowerFilterInput.addEventListener('input', () => {
  borrowerFilter = borrowerFilterInput.value;
  refreshLoans(currentFilter);
});

/**
 * Listeners do modal para seleção de data de devolução
 * - Cancelar: fecha modal sem fazer nada
 * - Confirmar: marca item como devolvido com data selecionada
 */

window.loanAPI.onMenu('menu:new-loan', () => {
  itemField.focus();
});

window.loanAPI.onMenu('menu:pending', () => {
  const nextFilter = currentFilter === 'pending' ? 'all' : 'pending';
  refreshLoans(nextFilter);
  switchView('overview');
});

window.loanAPI.onMenu('menu:clear', () => {
  handleClear();
});

// Event listeners para os filtros
statusFilterInputs.forEach((input) => {
  input.addEventListener('change', () => {
    statusFilter = input.value;
    refreshLoans(currentFilter);
  });
});

typeFilterSelect.addEventListener('change', () => {
  typeFilter = typeFilterSelect.value;
  refreshLoans(currentFilter);
});

borrowerFilterInput.addEventListener('input', () => {
  borrowerFilter = borrowerFilterInput.value;
  refreshLoans(currentFilter);
});

// Modal de data de devolução
returnCancelBtn.addEventListener('click', () => {
  returnModal.hidden = true;
  pendingReturnId = null;
});

returnConfirmBtn.addEventListener('click', async () => {
  if (pendingReturnId) {
    const returnDate = returnDateInput.value;
    await window.loanAPI.markReturned(pendingReturnId, returnDate);
    returnModal.hidden = true;
    pendingReturnId = null;
    refreshLoans(currentFilter);
  }
});

refreshProductCode();
refreshLoans();
switchView('register');
