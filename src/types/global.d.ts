import type { SettingsState } from "./pomo";

interface ElectronAPI {
  getSettings: () => Promise<SettingsState>;
  setSettings: (settings: SettingsState) => Promise<void>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
