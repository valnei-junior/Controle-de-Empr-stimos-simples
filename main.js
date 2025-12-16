const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');

const storeFile = () => path.join(app.getPath('userData'), 'loans.json');

const defaults = { loans: [], theme: 'light' };

// Lê o arquivo com os empréstimos e o tema.
// Retorna o estado padrão se não existir.
function readStore() {
  try {
    const raw = fs.readFileSync(storeFile(), 'utf8');
    return Object.assign({}, defaults, JSON.parse(raw));
  } catch (error) {
    return defaults;
  }
}

// Salva os dados enviados no disco do usuário.
function writeStore(data) {
  fs.mkdirSync(path.dirname(storeFile()), { recursive: true });
  fs.writeFileSync(storeFile(), JSON.stringify(data, null, 2));
}

let mainWindow;

// Cria a janela principal e carrega a tela.
function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 650,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());
  return win;
}

// Envia mensagens para a tela via IPC.
function broadcast(channel, payload) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, payload);
  }
}

// Monta o menu com atalhos para controlar os empréstimos.
function buildMenu() {
  const template = [
    {
      label: 'Controle',
      submenu: [
        { label: 'Novo empréstimo', click: () => broadcast('menu:new-loan') },
        { label: 'Itens pendentes', click: () => broadcast('menu:pending') },
        { type: 'separator' },
        { label: 'Limpar histórico', click: () => broadcast('menu:clear') },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  mainWindow = createWindow();
  buildMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('store:get', () => readStore());

ipcMain.handle('store:add', (event, payload) => {
  const store = readStore();
  const loan = Object.assign({
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    returned: false,
  }, payload);
  store.loans.unshift(loan);
  writeStore(store);
  return store;
});

ipcMain.handle('store:return', (event, loanId) => {
  const store = readStore();
  const target = store.loans.find((entry) => entry.id === loanId);
  if (target) {
    target.returned = true;
    target.returnedAt = new Date().toISOString();
    writeStore(store);
  }
  return store;
});

ipcMain.handle('store:clear', () => {
  const store = readStore();
  const reset = { ...store, loans: [] };
  writeStore(reset);
  return reset;
});

ipcMain.handle('store:setTheme', (event, theme) => {
  const store = readStore();
  store.theme = ['light', 'dark'].includes(theme) ? theme : 'light';
  writeStore(store);
  return store.theme;
});

ipcMain.handle('store:getTheme', () => {
  return readStore().theme;
});

ipcMain.handle('export:pdf', async () => {
  if (!mainWindow) {
    return { success: false, message: 'Janela indisponível.' };
  }
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar lista de empréstimos',
    defaultPath: path.join(app.getPath('documents'), 'emprestimos.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) {
    return { success: false, message: 'Exportação cancelada.' };
  }
  try {
    const pdfData = await mainWindow.webContents.printToPDF({
      marginsType: 1,
      pageSize: 'A4',
      printBackground: true,
    });
    fs.writeFileSync(filePath, pdfData);
    return { success: true, message: `PDF salvo em ${filePath}` };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
