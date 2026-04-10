import type {
  SavedSessionMetadata,
  SessionObject,
  SettingsState,
  WindowHotkeys,
} from "./pomo";

interface WindowState {
  clickThroughEnabled: boolean;
  windowOpacity: number;
  minimizeToTray: boolean;
  hotkeys: WindowHotkeys;
}

interface ElectronAPI {
  getSettings: () => Promise<SettingsState>;
  setSettings: (settings: SettingsState) => Promise<void>;
  getWindowState?: () => Promise<WindowState>;
  toggleClickThrough?: () => Promise<WindowState>;
  focusMainWindow?: () => Promise<void>;
  minimizeMainWindow?: () => Promise<void>;
  closeMainWindow?: () => Promise<void>;
  onWindowStateChanged?: (
    callback: (state: WindowState) => void
  ) => (() => void) | undefined;
  getSavedSessions?: () => Promise<SavedSessionMetadata[]>;
  getSavedSession?: (title: string) => Promise<SessionObject | null>;
  saveSavedSession?: (
    session: SessionObject,
    metadata: SavedSessionMetadata
  ) => Promise<void>;
  deleteSavedSession?: (title: string) => Promise<void>;
  replaceSavedSessions?: (payload: {
    index: SavedSessionMetadata[];
    items: Record<string, SessionObject>;
  }) => Promise<void>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
