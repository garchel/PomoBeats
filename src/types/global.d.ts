import type { SavedSessionMetadata, SessionObject, SettingsState } from "./pomo";

interface ElectronAPI {
  getSettings: () => Promise<SettingsState>;
  setSettings: (settings: SettingsState) => Promise<void>;
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
