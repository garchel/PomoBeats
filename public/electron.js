import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
  nativeImage,
} from "electron";
import Store from "electron-store";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_WINDOW_HOTKEYS = {
  toggleClickThrough: "CommandOrControl+Shift+X",
  focusWindow: "CommandOrControl+Shift+Space",
};

const DEFAULT_SETTINGS = {
  language: "pt-BR",
  autoCheckTasks: true,
  autoStartBreaks: false,
  autoStartPomos: false,
  windowOpacity: 92,
  clickThroughEnabled: false,
  minimizeToTray: true,
  hotkeys: DEFAULT_WINDOW_HOTKEYS,
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
};

const WINDOW_DIMENSIONS = {
  width: 440,
  height: 720,
};

let win = null;
let tray = null;
let isQuitting = false;

const store = new Store({
  defaults: {
    settings: DEFAULT_SETTINGS,
    sessions: {
      index: [],
      items: {},
    },
  },
});

const normalizeWindowOpacity = (value) => {
  const nextValue = Number.isFinite(value) ? value : DEFAULT_SETTINGS.windowOpacity;
  return Math.min(100, Math.max(35, Math.round(nextValue)));
};

const getSettings = () => {
  const storedSettings = store.get("settings");

  return {
    ...DEFAULT_SETTINGS,
    ...(storedSettings && typeof storedSettings === "object" ? storedSettings : {}),
    hotkeys: {
      ...DEFAULT_WINDOW_HOTKEYS,
      ...(storedSettings?.hotkeys && typeof storedSettings.hotkeys === "object"
        ? storedSettings.hotkeys
        : {}),
    },
    windowOpacity: normalizeWindowOpacity(storedSettings?.windowOpacity),
    clickThroughEnabled: Boolean(storedSettings?.clickThroughEnabled),
    minimizeToTray:
      typeof storedSettings?.minimizeToTray === "boolean"
        ? storedSettings.minimizeToTray
        : DEFAULT_SETTINGS.minimizeToTray,
  };
};

const getWindowState = () => {
  const settings = getSettings();

  return {
    clickThroughEnabled: settings.clickThroughEnabled,
    windowOpacity: settings.windowOpacity,
    minimizeToTray: settings.minimizeToTray,
    hotkeys: settings.hotkeys,
  };
};

const emitWindowState = () => {
  if (!win || win.isDestroyed()) {
    return;
  }

  win.webContents.send("window-state-changed", getWindowState());
};

const createTrayIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill="#ef4444" />
      <path d="M21 17h14c8.284 0 15 6.716 15 15s-6.716 15-15 15h-6v10h-8V17Zm8 8v14h6c3.866 0 7-3.134 7-7s-3.134-7-7-7h-6Z" fill="#fff"/>
    </svg>
  `.trim();

  return nativeImage
    .createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`)
    .resize({ width: 16, height: 16 });
};

const focusMainWindow = () => {
  if (!win || win.isDestroyed()) {
    return;
  }

  win.setSkipTaskbar(false);

  if (win.isMinimized()) {
    win.restore();
  }

  if (!win.isVisible()) {
    win.show();
  }

  win.focus();
};

const hideWindowToTray = () => {
  if (!win || win.isDestroyed()) {
    return;
  }

  win.setSkipTaskbar(true);
  win.hide();
};

const applyWindowSettings = (settings = getSettings()) => {
  if (!win || win.isDestroyed()) {
    return;
  }

  const normalizedOpacity = normalizeWindowOpacity(settings.windowOpacity);

  win.setOpacity(normalizedOpacity / 100);
  win.setIgnoreMouseEvents(Boolean(settings.clickThroughEnabled), {
    forward: Boolean(settings.clickThroughEnabled),
  });

  emitWindowState();
};

const registerShortcutWithFallback = (accelerator, fallback, handler) => {
  if (!accelerator) {
    return false;
  }

  try {
    if (globalShortcut.register(accelerator, handler)) {
      return true;
    }
  } catch (error) {
    console.error(`Falha ao registrar hotkey ${accelerator}:`, error);
  }

  if (fallback && fallback !== accelerator) {
    try {
      if (globalShortcut.register(fallback, handler)) {
        return true;
      }
    } catch (error) {
      console.error(`Falha ao registrar hotkey fallback ${fallback}:`, error);
    }
  }

  return false;
};

const toggleClickThrough = () => {
  const settings = getSettings();
  const nextSettings = {
    ...settings,
    clickThroughEnabled: !settings.clickThroughEnabled,
  };

  store.set("settings", nextSettings);
  applyWindowSettings(nextSettings);
  refreshTrayMenu();

  return getWindowState();
};

const registerGlobalShortcuts = (settings = getSettings()) => {
  globalShortcut.unregisterAll();

  registerShortcutWithFallback(
    settings.hotkeys.toggleClickThrough,
    DEFAULT_WINDOW_HOTKEYS.toggleClickThrough,
    () => {
      toggleClickThrough();
    }
  );

  registerShortcutWithFallback(
    settings.hotkeys.focusWindow,
    DEFAULT_WINDOW_HOTKEYS.focusWindow,
    () => {
      focusMainWindow();
      emitWindowState();
    }
  );
};

const createTray = () => {
  if (tray) {
    return tray;
  }

  tray = new Tray(createTrayIcon());
  tray.setToolTip("PomoBeats");
  tray.on("click", () => {
    focusMainWindow();
  });

  return tray;
};

const refreshTrayMenu = () => {
  const currentTray = createTray();
  const windowState = getWindowState();

  currentTray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Abrir PomoBeats",
        click: () => focusMainWindow(),
      },
      {
        label: windowState.clickThroughEnabled
          ? "Desativar click-through"
          : "Ativar click-through",
        click: () => {
          toggleClickThrough();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Sair",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );
};

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
    width: WINDOW_DIMENSIONS.width,
    height: WINDOW_DIMENSIONS.height,
    minWidth: WINDOW_DIMENSIONS.width,
    minHeight: WINDOW_DIMENSIONS.height,
    maxWidth: WINDOW_DIMENSIONS.width,
    maxHeight: WINDOW_DIMENSIONS.height,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#f7f4ef",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  win.once("ready-to-show", () => {
    applyWindowSettings();
    refreshTrayMenu();
    win?.show();
  });

  win.on("minimize", (event) => {
    if (!getSettings().minimizeToTray || isQuitting) {
      return;
    }

    event.preventDefault();
    hideWindowToTray();
  });

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  refreshTrayMenu();
  registerGlobalShortcuts();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
    refreshTrayMenu();
    registerGlobalShortcuts();
    return;
  }

  focusMainWindow();
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle("get-settings", () => getSettings());
ipcMain.handle("set-settings", (_event, newSettings) => {
  const currentSettings = getSettings();
  const nextSettings = {
    ...currentSettings,
    ...(newSettings && typeof newSettings === "object" ? newSettings : {}),
    hotkeys: {
      ...currentSettings.hotkeys,
      ...(newSettings?.hotkeys && typeof newSettings.hotkeys === "object"
        ? newSettings.hotkeys
        : {}),
    },
    windowOpacity:
      typeof newSettings?.windowOpacity === "number"
        ? normalizeWindowOpacity(newSettings.windowOpacity)
        : currentSettings.windowOpacity,
    clickThroughEnabled:
      typeof newSettings?.clickThroughEnabled === "boolean"
        ? newSettings.clickThroughEnabled
        : currentSettings.clickThroughEnabled,
    minimizeToTray:
      typeof newSettings?.minimizeToTray === "boolean"
        ? newSettings.minimizeToTray
        : currentSettings.minimizeToTray,
  };

  store.set("settings", nextSettings);
  applyWindowSettings(nextSettings);
  registerGlobalShortcuts(nextSettings);
  refreshTrayMenu();
});
ipcMain.handle("get-window-state", () => getWindowState());
ipcMain.handle("toggle-click-through", () => toggleClickThrough());
ipcMain.handle("focus-main-window", () => {
  focusMainWindow();
});
ipcMain.handle("minimize-main-window", () => {
  if (!win || win.isDestroyed()) {
    return;
  }

  if (getSettings().minimizeToTray) {
    hideWindowToTray();
    return;
  }

  win.minimize();
});
ipcMain.handle("close-main-window", () => {
  if (!win || win.isDestroyed()) {
    return;
  }

  isQuitting = true;
  win.close();
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
