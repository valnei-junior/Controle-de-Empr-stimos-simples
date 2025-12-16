const form = document.getElementById('loan-form');
const loanList = document.getElementById('loan-list');
const pendingCountEl = document.getElementById('pending-count');
const clearButton = document.getElementById('clear-button');
const themeToggle = document.getElementById('theme-toggle');
const filterLabel = document.getElementById('filter-label');
const itemField = document.getElementById('item-name');
const borrowerField = document.getElementById('borrower-name');
const dateField = document.getElementById('loan-date');
const tabButtons = document.querySelectorAll('[data-view]');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const exportButton = document.getElementById('export-button');

let currentFilter = 'all';
let currentTheme = 'light';

// Muda o visual da tela para o tema salvo (claro/escuro).
const applyTheme = (theme) => {
  currentTheme = theme;
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
};

// Deixa a data com o jeito usado aqui no Brasil.
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Refaz a lista de empréstimos e adiciona os botões de devolução.
const renderLoans = (loans) => {
  loanList.innerHTML = '';
  if (!loans.length) {
    const placeholder = document.createElement('li');
    placeholder.className = 'empty';
    placeholder.textContent = 'Nenhum empréstimo registrado.';
    loanList.appendChild(placeholder);
    return;
  }

  loans.forEach((loan) => {
    const li = document.createElement('li');
    li.className = loan.returned ? 'loan returned' : 'loan pending';

    const header = document.createElement('div');
    header.className = 'loan-header';
    header.innerHTML = `
      <strong>${loan.item}</strong>
      <span>${loan.returned ? 'Devolvido' : 'Pendente'}</span>
    `;

    const details = document.createElement('div');
    details.className = 'loan-details';
    details.innerHTML = `
      <p>${loan.borrower} · emprestado em ${formatDate(loan.loanDate)}</p>
      <p class="muted">Registrado em ${formatDate(loan.createdAt)}</p>
    `;

    li.appendChild(header);
    li.appendChild(details);

    if (!loan.returned) {
      const action = document.createElement('button');
      action.textContent = 'Marcar como devolvido';
      action.addEventListener('click', async () => {
        await window.loanAPI.markReturned(loan.id);
        refreshLoans(currentFilter);
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
};

// Puxa os dados do Electron e atualiza o filtro e a lista.
const refreshLoans = async (filter = 'all') => {
  const store = await window.loanAPI.loadStore();
  const loans = store.loans || [];
  const pendingOnly = filter === 'pending';
  const visibleLoans = pendingOnly ? loans.filter((loan) => !loan.returned) : loans;
  renderLoans(visibleLoans);
  const pendingCount = loans.filter((loan) => !loan.returned).length;
  pendingCountEl.textContent = pendingCount;
  filterLabel.textContent = pendingOnly ? 'Itens pendentes' : 'Exibindo tudo';
  applyTheme(store.theme || 'light');
  currentFilter = filter;
};

// Controla o envio do formulário e limpa os campos.
const handleFormSubmit = async (event) => {
  event.preventDefault();
  const payload = {
    item: itemField.value.trim(),
    borrower: borrowerField.value.trim(),
    loanDate: dateField.value || new Date().toISOString(),
  };
  if (!payload.item || !payload.borrower) {
    return;
  }
  await window.loanAPI.addLoan(payload);
  form.reset();
  dateField.value = '';
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

// Mostra só a aba escolhida.
const switchView = (viewId) => {
  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== viewId;
  });
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewId);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

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
  delete document.body.dataset.exporting;
};

if (exportButton) {
  exportButton.addEventListener('click', async () => {
    exportButton.disabled = true;
    let result;
    try {
      await enableExportMode();
      result = await window.loanAPI.exportPdf();
    } catch (error) {
      result = { message: error.message };
    } finally {
      disableExportMode();
    }
    exportButton.disabled = false;
    window.alert(result?.message || 'Exportação concluída.');
  });
}

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

refreshLoans();
switchView('overview');
