const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('loanAPI', {
  loadStore: () => ipcRenderer.invoke('store:get'),
  addLoan: (payload) => ipcRenderer.invoke('store:add', payload),
  markReturned: (id) => ipcRenderer.invoke('store:return', id),
  clearHistory: () => ipcRenderer.invoke('store:clear'),
  setTheme: (theme) => ipcRenderer.invoke('store:setTheme', theme),
  getTheme: () => ipcRenderer.invoke('store:getTheme'),
  exportPdf: () => ipcRenderer.invoke('export:pdf'),
  onMenu: (channel, callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
