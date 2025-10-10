// context/PomoContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { Page } from "../types/Page";
import toast, { Toaster } from "react-hot-toast";

export interface Interval {
  name: string;
  duration: number;
  type: string;
}

export interface SessionObject {
  title: string;
  intervals: Interval[];
}

interface SettingsState {
  autoCheckTasks: boolean;
  autoStartBreaks: boolean;
  autoStartPomos: boolean;
  selectedAlarm: string;
  customAlarm: boolean;
  customAlarmPath: string;
  selectedIntervalTrack: string;
  customIntervalTrackEnabled: boolean;
  customIntervalTrackPath: string;
}

interface PomoContextType {
  setTitle: (title: string) => void;
  session: SessionObject;
  setSession: (list: SessionObject) => void;
  saveSession: () => void;
  addPomo: (session: Omit<Interval, "type">) => void;
  addBreak: (session: Omit<Interval, "type">) => void;
  removeInterval: (index: number) => void;
  currentIntervalIndex: number | null;
  setCurrentIntervalIndex: (index: number | null) => void;
  isBreak: boolean;
  toggleBreak: () => void;
  isPlaying: boolean;
  playerActive: boolean;
  togglePlay: () => void;
  togglePlayer: () => void;
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  currentPage: Page;
  setPage: (page: Page) => void;
}

const PomoContext = createContext<PomoContextType | undefined>(undefined);

export const PomoProvider = ({ children }: { children: ReactNode }) => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [title, setTitle] = useState("");
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState<
    number | null
  >(null);
  const [isBreak, setIsBreak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerActive, setPlayerActive] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("sessionControl");
  const setPage = (page: Page) => setCurrentPage(page);

  const [settings, setSettings] = useState<SettingsState>({
    autoCheckTasks: true,
    autoStartBreaks: false,
    autoStartPomos: false,
    selectedAlarm: "Beep",
    customAlarm: false,
    customAlarmPath: "",
    selectedIntervalTrack: "Track 1",
    customIntervalTrackEnabled: false,
    customIntervalTrackPath: "",
  });

  const addPomo = (session: Omit<Interval, "type">) =>
    setIntervals((prev) => [...prev, { ...session, type: "pomo" }]);

  const addBreak = (session: Omit<Interval, "type">) =>
    setIntervals((prev) => [...prev, { ...session, type: "break" }]);

  const removeInterval = (index: number) =>
    setIntervals((prev) => prev.filter((_, i) => i !== index));

  const toggleBreak = () => setIsBreak((prev) => !prev);
  const togglePlay = () => setIsPlaying((prev) => !prev);
  const togglePlayer = () => setPlayerActive((prev) => !prev);

  const setSession = (list: SessionObject) => {
    setTitle(list.title);
    setIntervals(list.intervals);
  };

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings };

      // ⬇️ NOVO: Lógica para persistir as configurações no Electron
      if (window.electron && window.electron.setSettings) {
        window.electron.setSettings(updatedSettings).catch((error) => {
          console.error("Erro ao salvar configurações no Electron:", error);
          // Você pode ou não mostrar um toast de erro aqui, dependendo da UX desejada.
        });
      }

      return updatedSettings;
    });
  }, []);

  const saveSession = () => {
    if (!title.trim() || intervals.length === 0) {
      toast.error("Para salvar é necessário Título e Intervalos na Sessão. 😖");
      return;
    }
    const sessionMetadata = {
      title: title,
      intervals: intervals.length,
      timestamp: new Date().toLocaleDateString("pt-BR"),
    };

    const savedSessionsRaw = localStorage.getItem("savedPomoSessions");
    const existingSessions = savedSessionsRaw
      ? JSON.parse(savedSessionsRaw)
      : [];

    const listExists = existingSessions.some(
      (list: any) => list.title === title
    );

    if (!listExists) {
      existingSessions.push(sessionMetadata);
    } else {
      // Atualize a lista existente
      const index = existingSessions.findIndex(
        (list: any) => list.title === title
      );
      existingSessions[index] = sessionMetadata;
    }

    localStorage.setItem("savedPomoSessions", JSON.stringify(existingSessions));

    // 4. Salve a lista completa de sessões com o título como chave
    localStorage.setItem(title, JSON.stringify(session));
    toast.success("Lista salva com sucesso!");
  };

  // 🔑 Objeto completo centralizado
  const session: SessionObject = {
    title,
    intervals,
  };

  useEffect(() => {
    // 1. Verifica se estamos no Electron e se a API foi injetada
    if (window.electron && window.electron.getSettings) {
      window.electron
        .getSettings()
        .then((persistedSettings) => {
          // 2. O spread {...settings} garante que qualquer valor padrão (hardcoded) seja usado
          // se não estiver no 'persistedSettings' (útil para novas configurações).
          setSettings((prev) => ({ ...prev, ...persistedSettings }));
        })
        .catch((error) => {
          console.error("Erro ao carregar configurações do Electron:", error);
          toast.error("Erro ao carregar configurações salvas.");
        });
    }
  }, []);

  return (
    <PomoContext.Provider
      value={{
        setTitle,
        session,
        setSession,
        saveSession,
        addPomo,
        addBreak,
        removeInterval,
        currentIntervalIndex,
        setCurrentIntervalIndex,
        isBreak,
        toggleBreak,
        isPlaying,
        playerActive,
        togglePlay,
        togglePlayer,
        settings,
        updateSettings,
        currentPage,
        setPage,
      }}
    >
      {children}
    </PomoContext.Provider>
  );
};

export const usePomo = () => {
  const context = useContext(PomoContext);
  if (!context) throw new Error("usePomo must be used within PomoProvider");
  return context;
};
