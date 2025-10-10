import { app, BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import path from "path";

let win;

//Inicializa o store
const store = new Store({
  defaults: {
    settings: {
    autoCheckTasks: false,
    autoStartBreaks: false,
    autoStartPomos: false,
    selectedAlarm: "Beep",
    customAlarmPath: "",
    selectedIntervalTrack: "Track 1",
    customIntervalTrackPath: "",
    },
  },
});

// Função que cria a janela principal
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true, //manter por enquanto (permite usar ipcRenderer direto)
      contextIsolation: false, 
    },
  })

  const devUrl = "http://localhost:5173";
  win.loadURL(devUrl);

  win.on("closed", () => {
    win = null;
  });
}

// Cria a janela quando o app estiver pronto
app.on("ready", createWindow);

// Sai quando todas as janelas forem fechadas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
})

app.on("activate", () => {
  if (win === null) createWindow();
})

// IPC Handlers

// Pede as configurações atuais
ipcMain.handle("get-settings", () => {
  return store.get("settings");
});

//Atualiza as configurações
ipcMain.handle("set-settings", (event, newSettings) => {
  store.set("settings", newSettings);
  return true;
})