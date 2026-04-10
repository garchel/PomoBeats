import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings) => ipcRenderer.invoke("set-settings", settings),
  getWindowState: () => ipcRenderer.invoke("get-window-state"),
  toggleClickThrough: () => ipcRenderer.invoke("toggle-click-through"),
  focusMainWindow: () => ipcRenderer.invoke("focus-main-window"),
  minimizeMainWindow: () => ipcRenderer.invoke("minimize-main-window"),
  closeMainWindow: () => ipcRenderer.invoke("close-main-window"),
  onWindowStateChanged: (callback) => {
    if (typeof callback !== "function") {
      return undefined;
    }

    const listener = (_event, state) => callback(state);
    ipcRenderer.on("window-state-changed", listener);

    return () => {
      ipcRenderer.removeListener("window-state-changed", listener);
    };
  },
  getSavedSessions: () => ipcRenderer.invoke("get-saved-sessions"),
  getSavedSession: (title) => ipcRenderer.invoke("get-saved-session", title),
  saveSavedSession: (session, metadata) =>
    ipcRenderer.invoke("save-saved-session", session, metadata),
  deleteSavedSession: (title) => ipcRenderer.invoke("delete-saved-session", title),
  replaceSavedSessions: (payload) =>
    ipcRenderer.invoke("replace-saved-sessions", payload),
});
