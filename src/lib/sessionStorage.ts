import type {
  AppLanguage,
  Interval,
  SavedSessionMetadata,
  SessionObject,
} from "../types/pomo";
import { formatLocalizedDuration } from "./i18n";

const SAVED_SESSIONS_KEY = "savedPomoSessions";
const SESSION_KEY_PREFIX = "pomoSession:";

type LegacySavedListItem = {
  title?: unknown;
  sessions?: unknown;
  intervals?: unknown;
  timestamp?: unknown;
  updatedAt?: unknown;
  totalDuration?: unknown;
  intervalCount?: unknown;
};

const isElectronSessionApiAvailable = () =>
  Boolean(
    window.electron?.getSavedSessions &&
      window.electron?.getSavedSession &&
      window.electron?.saveSavedSession &&
      window.electron?.deleteSavedSession &&
      window.electron?.replaceSavedSessions
  );

const getElectronSessionApi = () => {
  if (!isElectronSessionApiAvailable()) {
    return null;
  }

  return window.electron as Required<
    Pick<
      NonNullable<typeof window.electron>,
      | "getSavedSessions"
      | "getSavedSession"
      | "saveSavedSession"
      | "deleteSavedSession"
      | "replaceSavedSessions"
    >
  >;
};

const isInterval = (value: unknown): value is Interval => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const interval = value as Record<string, unknown>;

  return (
    typeof interval.name === "string" &&
    typeof interval.duration === "number" &&
    Number.isFinite(interval.duration) &&
    interval.duration > 0 &&
    (interval.type === "pomo" || interval.type === "break")
  );
};

export const isSessionObject = (value: unknown): value is SessionObject => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.title === "string" &&
    Array.isArray(session.intervals) &&
    session.intervals.every(isInterval)
  );
};

export const normalizeSession = (value: unknown): SessionObject | null => {
  if (!isSessionObject(value)) {
    return null;
  }

  const title = value.title.trim();
  const intervals = value.intervals.map((interval) => ({
    name: interval.name.trim(),
    duration: interval.duration,
    type: interval.type,
  }));

  if (!title || intervals.length === 0 || intervals.some((item) => !item.name)) {
    return null;
  }

  return {
    title,
    intervals,
  };
};

export const formatDurationLabel = (
  totalMinutes: number,
  language: AppLanguage = "pt-BR"
) => formatLocalizedDuration(language, totalMinutes);

export const getSessionTotalDuration = (session: SessionObject) =>
  session.intervals.reduce((sum, interval) => sum + interval.duration, 0);

export const createSessionMetadata = (
  session: SessionObject
): SavedSessionMetadata => ({
  title: session.title,
  intervalCount: session.intervals.length,
  totalDuration: getSessionTotalDuration(session),
  updatedAt: new Date().toISOString(),
});

const normalizeSavedSessionMetadata = (
  entry: LegacySavedListItem
): SavedSessionMetadata | null => {
  if (!entry || typeof entry.title !== "string" || !entry.title.trim()) {
    return null;
  }

  const title = entry.title.trim();
  const intervalCount =
    typeof entry.intervalCount === "number"
      ? entry.intervalCount
      : typeof entry.sessions === "number"
        ? entry.sessions
        : typeof entry.intervals === "number"
          ? entry.intervals
          : 0;

  const totalDuration =
    typeof entry.totalDuration === "number" ? entry.totalDuration : 0;

  const updatedAtSource =
    typeof entry.updatedAt === "string"
      ? entry.updatedAt
      : typeof entry.timestamp === "string"
        ? entry.timestamp
        : new Date().toISOString();

  const normalizedUpdatedAt = new Date(updatedAtSource);

  return {
    title,
    intervalCount,
    totalDuration,
    updatedAt: Number.isNaN(normalizedUpdatedAt.getTime())
      ? new Date().toISOString()
      : normalizedUpdatedAt.toISOString(),
  };
};

const getSessionStorageKey = (title: string) => `${SESSION_KEY_PREFIX}${title}`;

const parseLegacySavedSessionIndex = (): SavedSessionMetadata[] => {
  const raw = localStorage.getItem(SAVED_SESSIONS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeSavedSessionMetadata(entry as LegacySavedListItem))
      .filter((entry): entry is SavedSessionMetadata => entry !== null);
  } catch {
    return [];
  }
};

const writeLegacySavedSessionIndex = (items: SavedSessionMetadata[]) => {
  localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(items));
};

const getLegacySavedSessions = () =>
  parseLegacySavedSessionIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const loadLegacySessionByTitle = (title: string): SessionObject | null => {
  const namespaced = localStorage.getItem(getSessionStorageKey(title));
  const legacy = localStorage.getItem(title);
  const raw = namespaced ?? legacy;

  if (!raw) {
    return null;
  }

  try {
    return normalizeSession(JSON.parse(raw));
  } catch {
    return null;
  }
};

const saveLegacySession = (session: SessionObject) => {
  const metadata = createSessionMetadata(session);
  const index = getLegacySavedSessions();
  const existingIndex = index.findIndex((item) => item.title === session.title);

  if (existingIndex >= 0) {
    index[existingIndex] = metadata;
  } else {
    index.push(metadata);
  }

  writeLegacySavedSessionIndex(index);
  localStorage.setItem(getSessionStorageKey(session.title), JSON.stringify(session));
};

const deleteLegacySession = (title: string) => {
  localStorage.removeItem(getSessionStorageKey(title));
  localStorage.removeItem(title);

  const index = getLegacySavedSessions().filter((item) => item.title !== title);
  writeLegacySavedSessionIndex(index);
};

const getLegacySessionPayloads = () => {
  const index = getLegacySavedSessions();
  const items: Record<string, SessionObject> = {};

  index.forEach((metadata) => {
    const session = loadLegacySessionByTitle(metadata.title);

    if (session) {
      items[metadata.title] = session;
    }
  });

  return {
    index: index.filter((metadata) => Boolean(items[metadata.title])),
    items,
  };
};

export const listSavedSessions = async () => {
  const electronApi = getElectronSessionApi();

  if (electronApi) {
    const sessions = await electronApi.getSavedSessions();
    return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return getLegacySavedSessions();
};

export const loadSavedSession = async (title: string): Promise<SessionObject | null> => {
  const electronApi = getElectronSessionApi();

  if (electronApi) {
    const session = await electronApi.getSavedSession(title);
    return normalizeSession(session);
  }

  return loadLegacySessionByTitle(title);
};

export const saveSessionRecord = async (session: SessionObject) => {
  const metadata = createSessionMetadata(session);
  const electronApi = getElectronSessionApi();

  if (electronApi) {
    await electronApi.saveSavedSession(session, metadata);
    return;
  }

  saveLegacySession(session);
};

export const deleteSessionRecord = async (title: string) => {
  const electronApi = getElectronSessionApi();

  if (electronApi) {
    await electronApi.deleteSavedSession(title);
    return;
  }

  deleteLegacySession(title);
};

const resolveImportedSessionTitleFromList = (
  baseTitle: string,
  sessions: SavedSessionMetadata[]
) => {
  const trimmedBaseTitle = baseTitle.trim();
  const existingTitles = new Set(sessions.map((item) => item.title));

  if (!existingTitles.has(trimmedBaseTitle)) {
    return trimmedBaseTitle;
  }

  let counter = 2;
  let candidate = `${trimmedBaseTitle} (${counter})`;

  while (existingTitles.has(candidate)) {
    counter += 1;
    candidate = `${trimmedBaseTitle} (${counter})`;
  }

  return candidate;
};

export const importSessionRecord = async (session: SessionObject) => {
  const savedSessions = await listSavedSessions();
  const resolvedTitle = resolveImportedSessionTitleFromList(session.title, savedSessions);
  const resolvedSession =
    resolvedTitle === session.title
      ? session
      : {
          ...session,
          title: resolvedTitle,
        };

  await saveSessionRecord(resolvedSession);

  return resolvedSession;
};

export const migrateLegacySessionsToElectron = async () => {
  const electronApi = getElectronSessionApi();

  if (!electronApi) {
    return false;
  }

  const electronSessions = await electronApi.getSavedSessions();

  if (electronSessions.length > 0) {
    return false;
  }

  const legacyPayload = getLegacySessionPayloads();

  if (legacyPayload.index.length === 0) {
    return false;
  }

  await electronApi.replaceSavedSessions(legacyPayload);
  return true;
};
