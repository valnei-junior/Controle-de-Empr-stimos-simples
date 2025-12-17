const form = document.getElementById('loan-form');
const loanList = document.getElementById('loan-list');
const pendingCountEl = document.getElementById('pending-count');
const clearButton = document.getElementById('clear-button');
const themeToggle = document.getElementById('theme-toggle');
const filterLabel = document.getElementById('filter-label');
const itemField = document.getElementById('item-name');
const borrowerField = document.getElementById('borrower-name');
const borrowerPhoneField = document.getElementById('borrower-phone');
const borrowerBirthdateField = document.getElementById('borrower-birthdate');
const borrowerAddressField = document.getElementById('borrower-address');
const borrowerCepField = document.getElementById('borrower-cep');
const borrowerNeighborhoodField = document.getElementById('borrower-neighborhood');
const borrowerNumberField = document.getElementById('borrower-number');
const dateField = document.getElementById('loan-date');
const itemTypeField = document.getElementById('item-type');
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
let cachedLoans = [];
let lastPhoneLookupDigits = '';
let lastPhoneAlertedDigits = '';

// Garante que a loanAPI existe e fornece fallbacks informativos quando faltar alguma função.
const loanAPI = (() => {
  const base = window.loanAPI;
  const warnMissing = (name) => console.warn(`loanAPI.${name} não está disponível. Verifique o preload.`);
  const ensure = (name, fallback) => {
    if (base && typeof base[name] === 'function') {
      return base[name].bind(base);
    }
    warnMissing(name);
    return fallback;
  };

  return {
    loadStore: ensure('loadStore', async () => ({ loans: [], theme: 'light' })),
    addLoan: ensure('addLoan', async () => {
      window.alert('Não foi possível registrar o empréstimo porque a API não está pronta.');
    }),
    markReturned: ensure('markReturned', async () => {
      window.alert('Não foi possível marcar como devolvido porque a API não está pronta.');
    }),
    clearHistory: ensure('clearHistory', async () => {
      window.alert('Não foi possível limpar o histórico porque a API não está pronta.');
    }),
    setTheme: ensure('setTheme', async () => 'light'),
    exportPdf: ensure('exportPdf', async () => ({ message: 'Exportação indisponível no momento.' })),
  };
})();

// Atualiza o tema ativo no body e ajusta o texto do botão de alternância.
const applyTheme = (theme) => {
  currentTheme = theme;
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
};

// Formata datas para o padrão brasileiro, retornando um placeholder quando não há valor.
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Gera um código único baseado no tipo do item, hora atual e um sufixo aleatório.
const generateProductCode = (type) => {
  const prefix = (type || 'ITEM').slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Recalcula o código do produto ao alterar o tipo do item.
const refreshProductCode = () => {
  if (!productCodeField) return;
  const type = itemTypeField?.value || 'Item';
  productCodeField.value = generateProductCode(type);
};

const cleanPhoneNumber = (value = '') => value.replace(/\D/g, '');

const populateBorrowerFromLoan = (loan) => {
  if (!loan) return;
  if (borrowerField) borrowerField.value = loan.borrower || borrowerField.value;
  if (borrowerBirthdateField) borrowerBirthdateField.value = loan.borrowerBirthdate || borrowerBirthdateField.value;
  if (borrowerAddressField) borrowerAddressField.value = loan.borrowerAddress || borrowerAddressField.value;
  if (borrowerCepField) borrowerCepField.value = loan.borrowerCep || borrowerCepField.value;
  if (borrowerNeighborhoodField) borrowerNeighborhoodField.value = loan.borrowerNeighborhood || borrowerNeighborhoodField.value;
  if (borrowerNumberField) borrowerNumberField.value = loan.borrowerNumber || borrowerNumberField.value;
  if (borrowerCepField) {
    applyCepMask();
    validateCepField();
  }
};

const handlePhoneLookup = () => {
  if (!borrowerPhoneField) return;
  const digits = cleanPhoneNumber(borrowerPhoneField.value);
  if (digits.length < 8) {
    lastPhoneLookupDigits = '';
    lastPhoneAlertedDigits = '';
    return;
  }
  if (digits === lastPhoneLookupDigits) return;
  lastPhoneLookupDigits = digits;
  const matches = cachedLoans.filter((loan) => cleanPhoneNumber(loan.borrowerPhone) === digits);
  if (!matches.length) {
    lastPhoneAlertedDigits = '';
    return;
  }
  populateBorrowerFromLoan(matches[0]);
  if (lastPhoneAlertedDigits !== digits) {
    const borrowerName = matches[0].borrower || 'esse telefone';
    const displayPhone = borrowerPhoneField.value || matches[0].borrowerPhone || digits;
    window.alert(`Já existem ${matches.length} empréstimo(s) registrados para ${borrowerName} (${displayPhone}). Os campos foram preenchidos com os dados existentes.`);
    lastPhoneAlertedDigits = digits;
  }
};

const findDuplicateLoan = async (item, borrower) => {
  if (!item || !borrower) return null;
  const store = await loanAPI.loadStore();
  const loans = store.loans || [];
  return loans.find((loan) =>
    loan.item.toLowerCase() === item.toLowerCase() &&
    loan.borrower.toLowerCase() === borrower.toLowerCase()
  );
};

const maskCep = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + '-' + digits.slice(5);
};

const applyCepMask = () => {
  if (!borrowerCepField) return;
  borrowerCepField.value = maskCep(borrowerCepField.value);
};

const validateCepField = () => {
  if (!borrowerCepField) return true;
  const value = borrowerCepField.value.trim();
  if (!value) {
    borrowerCepField.setCustomValidity('');
    return true;
  }
  const valid = /^\d{5}-\d{3}$/.test(value);
  borrowerCepField.setCustomValidity(valid ? '' : 'Informe um CEP válido no formato 00000-000.');
  return valid;
};

const fetchAddressByCep = async (cepValue) => {
  if (!cepValue) return null;
  const cleanedCep = cepValue.replace(/\D/g, '');
  if (cleanedCep.length !== 8) return null;
  if (typeof fetch !== 'function') return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    if (!response.ok) return null;
    const payload = await response.json();
    if (payload.erro) {
      return null;
    }
    return payload;
  } catch (error) {
    console.warn('CEP lookup falhou', error);
    return null;
  }
};

const handleCepLookup = async () => {
  if (!borrowerCepField) return;
  if (!validateCepField()) return;
  const cepValue = borrowerCepField.value.trim();
  if (!cepValue) return;
  const data = await fetchAddressByCep(cepValue);
  if (!data) return;
  if (borrowerAddressField && !borrowerAddressField.value.trim()) {
    borrowerAddressField.value = data.logradouro || borrowerAddressField.value;
  }
  if (borrowerNeighborhoodField && !borrowerNeighborhoodField.value.trim()) {
    borrowerNeighborhoodField.value = data.bairro || '';
  }
};

const composeReminderMessage = (loan) => {
  const borrower = loan.borrower || 'Contato';
  const item = loan.item || 'item emprestado';
  const dueDate = formatDate(loan.loanDate);
  const productCode = loan.productCode ? `Código: ${loan.productCode}` : '';
  return `Olá ${borrower}, o empréstimo de ${item} registado em ${dueDate} encontra-se pendente. ${productCode}`;
};

const handleSendMessage = async (loan) => {
  if (!loan.borrowerPhone) {
    window.alert('Não há telefone disponível para este empréstimo.');
    return;
  }
  const message = composeReminderMessage(loan);
  const sendPayload = { to: loan.borrowerPhone, message };
  try {
    await loanAPI.sendSms(sendPayload);
    window.alert('Mensagem enviada com sucesso.');
    return;
  } catch (error) {
    console.warn('Envio do SMS falhou', error);
    window.alert('Não foi possível enviar o SMS. A mensagem foi copiada para você remeter manualmente.');
  }
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(message);
      window.alert('Mensagem de lembrete copiada para a área de transferência. Cole no WhatsApp/Telegram para enviar.');
      return;
    } catch (error) {
      console.warn('Clipboard copy falhou', error);
    }
  }
  window.prompt('Copie a mensagem abaixo e envie pelo canal preferido:', message);
};

// Renderiza a lista de empréstimos aplicando estados visuais e ações de devolução.
// Cria o elemento de lista para um empréstimo e aplica ações e detalhes.
const createLoanElement = (loan) => {
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
    <p class="muted">Código: ${loan.productCode || '-'}</p>
    <p class="muted">Telefone: ${loan.borrowerPhone || '-'}</p>
    <p class="muted">Nascimento: ${formatDate(loan.borrowerBirthdate)}</p>
    <p class="muted">CEP: ${loan.borrowerCep || '-'}</p>
    <p class="muted">Endereço: ${loan.borrowerAddress || '-'}</p>
    <p class="muted">Bairro: ${loan.borrowerNeighborhood || '-'}</p>
    <p class="muted">Número: ${loan.borrowerNumber || '-'}</p>
    ${loan.relatedProductCode ? `<p class="muted">Relacionado ao código: ${loan.relatedProductCode}</p>` : ''}
  `;

  li.appendChild(header);
  li.appendChild(details);

  const actionBar = document.createElement('div');
  actionBar.className = 'loan-actions';
  if (!loan.returned) {
    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = 'Marcar como devolvido';
    action.addEventListener('click', () => {
      pendingReturnId = loan.id;
      if (returnModal) {
        returnDateInput.value = new Date().toISOString().split('T')[0];
        returnModal.hidden = false;
      }
    });
    actionBar.appendChild(action);
    if (loan.borrowerPhone) {
      const messageButton = document.createElement('button');
      messageButton.type = 'button';
      messageButton.textContent = 'Enviar mensagem';
      messageButton.addEventListener('click', () => handleSendMessage(loan));
      actionBar.appendChild(messageButton);
    }
  } else if (loan.returnedAt) {
    const returnedAt = document.createElement('p');
    returnedAt.className = 'muted small';
    returnedAt.textContent = `Devolvido em ${formatDate(loan.returnedAt)}`;
    actionBar.appendChild(returnedAt);
  }
  if (actionBar.childElementCount) {
    li.appendChild(actionBar);
  }

  return li;
};

const renderLoans = (loans) => {
  if (!loanList) return;
  loanList.innerHTML = '';
  if (!loans.length) {
    const placeholder = document.createElement('li');
    placeholder.className = 'empty';
    placeholder.textContent = 'Nenhum empréstimo registrado.';
    loanList.appendChild(placeholder);
    return;
  }

  loans.forEach((loan) => {
    loanList.appendChild(createLoanElement(loan));
  });
};

// Aplica filtros de status, tipo e tomador sobre o conjunto completo de empréstimos.
const applyFilters = (loans) => {
  let filtered = [...loans];

  if (statusFilter === 'pending') {
    filtered = filtered.filter((loan) => !loan.returned);
  } else if (statusFilter === 'returned') {
    filtered = filtered.filter((loan) => loan.returned);
  }

  if (typeFilter) {
    filtered = filtered.filter((loan) => loan.type === typeFilter);
  }

  if (borrowerFilter) {
    const searchValue = borrowerFilter.toLowerCase().trim();
    const numericSearch = borrowerFilter.replace(/\D/g, '');
    filtered = filtered.filter((loan) => {
      const matchesName = loan.borrower.toLowerCase().includes(searchValue);
      const matchesPhone = numericSearch
        ? cleanPhoneNumber(loan.borrowerPhone).includes(numericSearch)
        : false;
      return matchesName || matchesPhone;
    });
  }

  return filtered;
};

// Recarrega dados da store, renderiza empréstimos visíveis e atualiza contadores.
const refreshLoans = async (filter = 'all') => {
  const store = await loanAPI.loadStore();
  const loans = store.loans || [];
  cachedLoans = loans;
  const visibleLoans = applyFilters(loans);
  renderLoans(visibleLoans);
  const pendingCount = loans.filter((loan) => !loan.returned).length;
  if (pendingCountEl) {
    pendingCountEl.textContent = pendingCount;
  }
  if (filterLabel) {
    filterLabel.textContent = `${visibleLoans.length} item(ns)`;
  }
  applyTheme(store.theme || 'light');
  currentFilter = filter;
};

// Tratador do envio do formulário, valida entradas e registra novo empréstimo.
const handleFormSubmit = async (event) => {
  event.preventDefault();
  if (!validateCepField()) {
    borrowerCepField?.reportValidity();
    return;
  }
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const payload = {
    item: itemField.value.trim(),
    borrower: borrowerField.value.trim(),
    borrowerPhone: borrowerPhoneField?.value.trim() || '',
    borrowerBirthdate: borrowerBirthdateField?.value || '',
    borrowerAddress: borrowerAddressField?.value.trim(),
    borrowerCep: borrowerCepField?.value.trim(),
    borrowerNeighborhood: borrowerNeighborhoodField?.value.trim() || '',
    borrowerNumber: borrowerNumberField?.value.trim() || '',
    loanDate: dateField.value || new Date().toISOString(),
    type: itemTypeField?.value,
    productCode: productCodeField?.value,
  };
  if (!payload.item || !payload.borrower) {
    return;
  }
  const duplicate = await findDuplicateLoan(payload.item, payload.borrower);
  if (duplicate) {
    const msg = `Já existe um empréstimo para ${payload.borrower} (${payload.item}). Deseja registrar mesmo assim e vincular ao mesmo cadastro?`;
    const confirmed = window.confirm(msg);
    if (!confirmed) {
      return;
    }
    payload.relatedLoanId = duplicate.id;
    payload.relatedProductCode = duplicate.productCode || '';
  }
  await loanAPI.addLoan(payload);
  form.reset();
  refreshProductCode();
  refreshLoans(currentFilter);
};

// Limpa o histórico completo após confirmação do usuário.
const handleClear = async () => {
  const confirmed = window.confirm('Isso irá apagar todo o histórico de empréstimos. Deseja continuar?');
  if (!confirmed) return;
  await loanAPI.clearHistory();
  refreshLoans('all');
};

// Alterna entre os painéis visíveis com base na aba selecionada.
const switchView = (viewId) => {
  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== viewId;
  });
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewId);
  });
};

// Habilita ajustes visuais para exportação (lista somente) antes de gerar PDF.
const enableExportMode = () => {
  document.body.dataset.exporting = 'list-only';
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
};

// Remove sinalizadores de exportação e restaura feedback visual padrão.
const disableExportMode = () => {
  delete document.body.dataset.exporting;
};

// Fecha o modal de devolução e limpa o empréstimo pendente.
const closeReturnModal = () => {
  if (returnModal) {
    returnModal.hidden = true;
  }
  pendingReturnId = null;
};

form?.addEventListener('submit', handleFormSubmit);
clearButton?.addEventListener('click', handleClear);

tabButtons.forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

itemTypeField?.addEventListener('change', refreshProductCode);

themeToggle?.addEventListener('click', async () => {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  await loanAPI.setTheme(next);
  applyTheme(next);
});

if (exportButton) {
  exportButton.addEventListener('click', async () => {
    exportButton.disabled = true;
    let result;
    try {
      await enableExportMode();
      result = await loanAPI.exportPdf();
    } catch (error) {
      result = { message: error.message };
    } finally {
      disableExportMode();
    }
    exportButton.disabled = false;
    window.alert(result?.message || 'Exportação concluída.');
  });
}

returnCancelBtn?.addEventListener('click', closeReturnModal);
returnConfirmBtn?.addEventListener('click', async () => {
  if (!pendingReturnId) return;
  await loanAPI.markReturned(pendingReturnId);
  closeReturnModal();
  refreshLoans(currentFilter);
});

statusFilterInputs.forEach((input) => {
  input.addEventListener('change', () => {
    statusFilter = input.value;
    refreshLoans(currentFilter);
  });
});

typeFilterSelect?.addEventListener('change', () => {
  typeFilter = typeFilterSelect.value;
  refreshLoans(currentFilter);
});

borrowerFilterInput?.addEventListener('input', () => {
  borrowerFilter = borrowerFilterInput.value;
  refreshLoans(currentFilter);
});

borrowerCepField?.addEventListener('input', () => {
  applyCepMask();
  validateCepField();
});

borrowerCepField?.addEventListener('blur', () => {
  validateCepField();
  handleCepLookup();
});

borrowerPhoneField?.addEventListener('input', handlePhoneLookup);
borrowerPhoneField?.addEventListener('blur', handlePhoneLookup);

refreshProductCode();
refreshLoans();
switchView('register');
