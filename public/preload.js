import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings) => ipcRenderer.invoke("set-settings", settings),
  getSavedSessions: () => ipcRenderer.invoke("get-saved-sessions"),
  getSavedSession: (title) => ipcRenderer.invoke("get-saved-session", title),
  saveSavedSession: (session, metadata) =>
    ipcRenderer.invoke("save-saved-session", session, metadata),
  deleteSavedSession: (title) => ipcRenderer.invoke("delete-saved-session", title),
  replaceSavedSessions: (payload) =>
    ipcRenderer.invoke("replace-saved-sessions", payload),
});
