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
      autoCheckTasks: true,
      autoStartBreaks: false,
      autoStartPomos: false,
      alarmEnabled: true,
      selectedAlarm: "Beep",
      alarmVolume: 60,
      customAlarm: false,
      customAlarmPath: "",
      studyMusicEnabled: true,
      studyMusicSource: "generated",
      studyRadioCategory: "lofi",
      selectedStudyTrack: "Track 1",
      studyTrackVolume: 35,
      customStudyTrackEnabled: false,
      customStudyTrackPath: "",
      intervalMusicEnabled: true,
      intervalMusicSource: "generated",
      intervalRadioCategory: "lofi",
      selectedIntervalTrack: "Track 1",
      intervalTrackVolume: 35,
      customIntervalTrackEnabled: false,
      customIntervalTrackPath: "",
    },
  },
});

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
