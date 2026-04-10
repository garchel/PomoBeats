import { app, BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win = null;

const store = new Store({
  defaults: {
    settings: {
      language: "pt-BR",
      autoCheckTasks: true,
      autoStartBreaks: false,
      autoStartPomos: false,
      alarmEnabled: true,
      selectedAlarm: "Beep",
      alarmVolume: 60,
      customAlarm: false,
      customAlarmPath: "",
      studyMusicEnabled: true,
      studyMusicSource: "radio",
      studyRadioCategory: "lofi",
      selectedStudyTrack: "Track 1",
      studyTrackVolume: 35,
      customStudyTrackEnabled: false,
      customStudyTrackPath: "",
      intervalMusicEnabled: true,
      intervalMusicSource: "radio",
      intervalRadioCategory: "lofi",
      selectedIntervalTrack: "Track 1",
      intervalTrackVolume: 35,
      customIntervalTrackEnabled: false,
      customIntervalTrackPath: "",
    },
    sessions: {
      index: [],
      items: {},
    },
  },
});

const getStoredSessionsIndex = () => {
  const index = store.get("sessions.index");

  return Array.isArray(index) ? index : [];
};

const getStoredSessionsItems = () => {
  const items = store.get("sessions.items");

  return items && typeof items === "object" ? items : {};
};

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle("get-settings", () => store.get("settings"));
ipcMain.handle("set-settings", (_event, newSettings) => {
  store.set("settings", newSettings);
});
ipcMain.handle("get-saved-sessions", () => getStoredSessionsIndex());
ipcMain.handle("get-saved-session", (_event, title) => {
  const items = getStoredSessionsItems();

  return items[title] ?? null;
});
ipcMain.handle("save-saved-session", (_event, session, metadata) => {
  const index = getStoredSessionsIndex().filter((entry) => entry.title !== metadata.title);
  const items = getStoredSessionsItems();

  index.push(metadata);
  items[metadata.title] = session;

  store.set("sessions.index", index);
  store.set("sessions.items", items);
});
ipcMain.handle("delete-saved-session", (_event, title) => {
  const index = getStoredSessionsIndex().filter((entry) => entry.title !== title);
  const items = getStoredSessionsItems();

  delete items[title];

  store.set("sessions.index", index);
  store.set("sessions.items", items);
});
ipcMain.handle("replace-saved-sessions", (_event, payload) => {
  store.set("sessions.index", Array.isArray(payload?.index) ? payload.index : []);
  store.set(
    "sessions.items",
    payload?.items && typeof payload.items === "object" ? payload.items : {}
  );
});
