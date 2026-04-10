/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { PomoAudioController } from "../lib/audio";
import { getLocale, translate, type TranslationKey } from "../lib/i18n";
import type { RadioCandidate } from "../lib/radioBrowser";
import {
  migrateLegacySessionsToElectron,
  normalizeSession,
  saveSessionRecord,
} from "../lib/sessionStorage";
import type { Interval, SessionObject, SettingsState } from "../types/pomo";
import type { Page } from "../types/Page";

interface PomoContextType {
  setTitle: (title: string) => void;
  session: SessionObject;
  setSession: (list: SessionObject) => void;
  saveSession: () => Promise<void>;
  addPomo: (session: Omit<Interval, "type">) => void;
  addBreak: (session: Omit<Interval, "type">) => void;
  removeInterval: (index: number) => void;
  currentIntervalIndex: number | null;
  currentInterval: Interval | null;
  remainingSeconds: number;
  isBreak: boolean;
  toggleBreak: () => void;
  isPlaying: boolean;
  playerActive: boolean;
  isSessionComplete: boolean;
  startPlayer: () => void;
  pausePlayer: () => void;
  resumePlayer: () => void;
  resetPlayer: () => void;
  goToNextInterval: () => void;
  goToPreviousInterval: () => void;
  activeRadioCandidates: RadioCandidate[];
  activeRadioChannelIndex: number | null;
  isCurrentIntervalUsingRadio: boolean;
  activeRadioChannelStates: Record<string, "idle" | "loading" | "playing" | "error">;
  selectRadioChannel: (index: number) => void;
  settings: SettingsState;
  language: SettingsState["language"];
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  currentPage: Page;
  setPage: (page: Page) => void;
}

const PomoContext = createContext<PomoContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SettingsState = {
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
};

export const PomoProvider = ({ children }: { children: ReactNode }) => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [title, setTitle] = useState("");
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState<number | null>(
    null
  );
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerActive, setPlayerActive] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("sessionControl");
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [activeRadioCandidates, setActiveRadioCandidates] = useState<RadioCandidate[]>([]);
  const [selectedRadioCandidateId, setSelectedRadioCandidateId] = useState<string | null>(null);
  const [activeRadioChannelStates, setActiveRadioChannelStates] = useState<
    Record<string, "idle" | "loading" | "playing" | "error">
  >({});
  const audioControllerRef = useRef<PomoAudioController | null>(null);
  const activeRadioCandidatesRef = useRef<RadioCandidate[]>([]);
  const selectedRadioCandidateIdRef = useRef<string | null>(null);

  const session: SessionObject = {
    title,
    intervals,
  };
  const language = settings.language;
  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) =>
      translate(language, key, values),
    [language]
  );

  const currentInterval = useMemo(
    () => (currentIntervalIndex === null ? null : intervals[currentIntervalIndex] ?? null),
    [currentIntervalIndex, intervals]
  );
  const isCurrentIntervalUsingRadio = useMemo(() => {
    if (!currentInterval) {
      return false;
    }

    return currentInterval.type === "pomo"
      ? settings.studyMusicSource === "radio"
      : settings.intervalMusicSource === "radio";
  }, [currentInterval, settings.intervalMusicSource, settings.studyMusicSource]);
  const activeRadioChannelIndex = useMemo(
    () =>
      selectedRadioCandidateId
        ? activeRadioCandidates.findIndex(
            (candidate) => candidate.id === selectedRadioCandidateId
          )
        : -1,
    [activeRadioCandidates, selectedRadioCandidateId]
  );

  if (!audioControllerRef.current) {
    audioControllerRef.current = new PomoAudioController();
  }

  useEffect(() => {
    activeRadioCandidatesRef.current = activeRadioCandidates;
  }, [activeRadioCandidates]);

  useEffect(() => {
    selectedRadioCandidateIdRef.current = selectedRadioCandidateId;
  }, [selectedRadioCandidateId]);

  const clearPlaybackState = useCallback((keepPlayerVisible = false) => {
    audioControllerRef.current?.stopIntervalTrack();
    setActiveRadioCandidates([]);
    setSelectedRadioCandidateId(null);
    setActiveRadioChannelStates({});
    setCurrentIntervalIndex(null);
    setRemainingSeconds(0);
    setIsPlaying(false);
    setPlayerActive(keepPlayerVisible);
    setIsSessionComplete(false);
  }, []);

  const pauseForNavigation = useCallback(() => {
    audioControllerRef.current?.stopIntervalTrack();
    setIsPlaying(false);
    setPlayerActive(true);
  }, []);

  const setPage = useCallback(
    (page: Page) => {
      setCurrentPage((previousPage) => {
        if (previousPage === "player" && page !== "player") {
          pauseForNavigation();
        }

        return page;
      });
    },
    [pauseForNavigation]
  );

  const activateInterval = useCallback(
    (index: number, shouldPlay: boolean) => {
      const nextInterval = intervals[index];

      if (!nextInterval) {
        return false;
      }

      setActiveRadioCandidates([]);
      setSelectedRadioCandidateId(null);
      setActiveRadioChannelStates({});
      setCurrentIntervalIndex(index);
      setRemainingSeconds(nextInterval.duration * 60);
      setPlayerActive(true);
      setIsPlaying(shouldPlay);
      setIsSessionComplete(false);
      return true;
    },
    [intervals]
  );

  const shouldAutoStartInterval = useCallback(
    (interval: Interval) =>
      interval.type === "break" ? settings.autoStartBreaks : settings.autoStartPomos,
    [settings.autoStartBreaks, settings.autoStartPomos]
  );

  const completeSession = useCallback(() => {
    audioControllerRef.current?.stopIntervalTrack();
    setRemainingSeconds(0);
    setIsPlaying(false);
    setPlayerActive(true);
    setIsSessionComplete(true);
  }, []);

  const addPomo = (interval: Omit<Interval, "type">) => {
    clearPlaybackState();
    setIntervals((prev) => [...prev, { ...interval, type: "pomo" }]);
  };

  const addBreak = (interval: Omit<Interval, "type">) => {
    clearPlaybackState();
    setIntervals((prev) => [...prev, { ...interval, type: "break" }]);
  };

  const removeInterval = (index: number) => {
    clearPlaybackState();
    setIntervals((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleBreak = () => setIsBreak((prev) => !prev);

  const setSession = (nextSession: SessionObject) => {
    clearPlaybackState();
    setTitle(nextSession.title);
    setIntervals(nextSession.intervals);
  };

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings };

      if (window.electron?.setSettings) {
        window.electron.setSettings(updatedSettings).catch((error) => {
          console.error("Erro ao salvar configuracoes no Electron:", error);
        });
      }

      return updatedSettings;
    });
  }, []);

  const startPlayer = useCallback(() => {
    if (intervals.length === 0) {
      toast.error(t("context.startError"));
      return;
    }

    if (currentIntervalIndex === null || isSessionComplete) {
      activateInterval(0, true);
      return;
    }

    setPlayerActive(true);
    setIsSessionComplete(false);
    setIsPlaying(true);
  }, [activateInterval, currentIntervalIndex, intervals.length, isSessionComplete, t]);

  const pausePlayer = useCallback(() => {
    setPlayerActive(true);
    setIsPlaying(false);
  }, []);

  const selectRadioChannel = useCallback((index: number) => {
    const nextCandidate = activeRadioCandidates[index];

    if (!nextCandidate) {
      return;
    }

    setSelectedRadioCandidateId(nextCandidate.id);
  }, [activeRadioCandidates]);

  const resumePlayer = useCallback(() => {
    if (intervals.length === 0) {
      toast.error(t("context.startError"));
      return;
    }

    if (currentIntervalIndex === null || isSessionComplete) {
      activateInterval(0, true);
      return;
    }

    setPlayerActive(true);
    setIsSessionComplete(false);
    setIsPlaying(true);
  }, [activateInterval, currentIntervalIndex, intervals.length, isSessionComplete, t]);

  const resetPlayer = useCallback(() => {
    clearPlaybackState();
  }, [clearPlaybackState]);

  const goToNextInterval = useCallback(() => {
    if (intervals.length === 0) {
      return;
    }

    if (currentIntervalIndex === null) {
      activateInterval(0, true);
      return;
    }

    const nextIndex = currentIntervalIndex + 1;

    if (nextIndex >= intervals.length) {
      completeSession();
      return;
    }

    activateInterval(nextIndex, isPlaying);
  }, [activateInterval, completeSession, currentIntervalIndex, intervals.length, isPlaying]);

  const goToPreviousInterval = useCallback(() => {
    if (intervals.length === 0) {
      return;
    }

    if (currentIntervalIndex === null || currentIntervalIndex <= 0) {
      activateInterval(0, isPlaying);
      return;
    }

    activateInterval(currentIntervalIndex - 1, isPlaying);
  }, [activateInterval, currentIntervalIndex, intervals.length, isPlaying]);

  const saveSession = async () => {
    const normalizedSession = normalizeSession(session);

    if (!normalizedSession) {
      toast.error(t("context.saveError"));
      return;
    }

    await saveSessionRecord(normalizedSession);
    setSession(normalizedSession);
    toast.success(t("context.saveSuccess"));
  };

  useEffect(() => {
    if (!isPlaying || currentIntervalIndex === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentIntervalIndex, isPlaying]);

  useEffect(() => {
    if (!isPlaying || !currentInterval) {
      audioControllerRef.current?.stopIntervalTrack();
      return;
    }

    const preferredRadioCandidate =
      selectedRadioCandidateIdRef.current === null
        ? null
        : activeRadioCandidatesRef.current.find(
            (candidate) => candidate.id === selectedRadioCandidateIdRef.current
          ) ?? null;

    audioControllerRef.current
      ?.startIntervalTrack(settings, currentInterval, {
        preferredRadioCandidate,
        onRadioCandidatesResolved: (candidates) => {
          setActiveRadioCandidates((previous) => {
            const previousIds = previous.map((candidate) => candidate.id).join("|");
            const nextIds = candidates.map((candidate) => candidate.id).join("|");

            if (previousIds === nextIds) {
              return previous;
            }

            return candidates;
          });
          setActiveRadioChannelStates(
            Object.fromEntries(candidates.map((candidate) => [candidate.id, "idle"]))
          );
          setSelectedRadioCandidateId((previous) => {
            if (previous && candidates.some((candidate) => candidate.id === previous)) {
              return previous;
            }

            return candidates[0]?.id ?? null;
          });
        },
        onRadioStatusChange: (candidateId, status) => {
          setActiveRadioChannelStates((previous) => ({
            ...previous,
            [candidateId]: status,
          }));
        },
      })
      .catch(() => undefined);

    return () => {
      audioControllerRef.current?.stopIntervalTrack();
    };
  }, [currentInterval, isPlaying, selectedRadioCandidateId, settings]);

  useEffect(() => {
    if (!isPlaying || currentIntervalIndex === null || remainingSeconds > 0) {
      return;
    }

    audioControllerRef.current?.playAlarm(settings).catch(() => undefined);

    const nextIndex = currentIntervalIndex + 1;

    if (nextIndex >= intervals.length) {
      completeSession();
      return;
    }

    const nextInterval = intervals[nextIndex];
    activateInterval(nextIndex, shouldAutoStartInterval(nextInterval));
  }, [
    activateInterval,
    completeSession,
    currentIntervalIndex,
    intervals,
    isPlaying,
    remainingSeconds,
    settings,
    shouldAutoStartInterval,
  ]);

  useEffect(() => {
    if (intervals.length === 0) {
      clearPlaybackState();
      return;
    }

    if (currentIntervalIndex !== null && currentIntervalIndex >= intervals.length) {
      activateInterval(intervals.length - 1, false);
    }
  }, [activateInterval, clearPlaybackState, currentIntervalIndex, intervals.length]);

  useEffect(() => {
    if (window.electron?.getSettings) {
      window.electron
        .getSettings()
        .then((persistedSettings) => {
          setSettings((prev) => ({ ...prev, ...persistedSettings }));
        })
        .catch((error) => {
          console.error("Erro ao carregar configuracoes do Electron:", error);
          toast.error(t("context.settingsLoadError"));
        });
    }
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = getLocale(language);
  }, [language]);

  useEffect(() => {
    migrateLegacySessionsToElectron().catch((error) => {
      console.error("Erro ao migrar sessoes legadas para o Electron:", error);
    });
  }, []);

  useEffect(() => {
    return () => {
      audioControllerRef.current?.dispose();
    };
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
        currentInterval,
        remainingSeconds,
        isBreak,
        toggleBreak,
        isPlaying,
        playerActive,
        isSessionComplete,
        startPlayer,
        pausePlayer,
        resumePlayer,
        resetPlayer,
        goToNextInterval,
        goToPreviousInterval,
        activeRadioCandidates,
        activeRadioChannelIndex:
          activeRadioChannelIndex >= 0 ? activeRadioChannelIndex : null,
        isCurrentIntervalUsingRadio,
        activeRadioChannelStates,
        selectRadioChannel,
        settings,
        language,
        t,
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

  if (!context) {
    throw new Error("usePomo must be used within PomoProvider");
  }

  return context;
};
