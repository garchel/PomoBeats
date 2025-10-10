const { contextBridge, ipcRenderer } = require("electron");

const settingsAPI = {
  // Função que chama o ipcMain.handle('get-settings')
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // Função que chama o ipcMainhandle('get-settings') e passa o objeto
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),

};

// Expôe o objeto 'settingsAPI' no objeto global 'window' do seu React mas sob o nome 'electron'.
contextBridge.exposeInMainWorld('electron', settingsAPI);

// O seu log original
window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron preload carregado e API exposta.");
});