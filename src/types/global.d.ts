import { SettingsState } from '../context/PomoContext';

interface ElectronAPI {
    // Função que retorna as configurações. O tipo Promise é porque ipcRenderer.invoke é assíncrono.
    getSettings: () => Promise<SettingsState>;

    // Função que recebe as configurações a serem salvas.
    setSettings: (settings: SettingsState) => Promise<void>; // O 'main.js' retorna true, mas podemos tipar como void para simplicidade.
}

// Declara o objeto global 'electron' que será injetado pelo preload script
declare global {
    interface Window {
        electron: ElectronAPI;
    }
}