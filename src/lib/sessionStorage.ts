import type {
  Interval,
  SavedSessionMetadata,
  SessionObject,
} from "../types/pomo";

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

export const formatDurationLabel = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
};

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

const parseSavedSessionIndex = (): SavedSessionMetadata[] => {
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

const writeSavedSessionIndex = (items: SavedSessionMetadata[]) => {
  localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(items));
};

const getSessionStorageKey = (title: string) => `${SESSION_KEY_PREFIX}${title}`;

export const getSavedSessions = () =>
  parseSavedSessionIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const loadSessionByTitle = (title: string): SessionObject | null => {
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

export const saveSessionToStorage = (session: SessionObject) => {
  const metadata = createSessionMetadata(session);
  const index = getSavedSessions();
  const existingIndex = index.findIndex((item) => item.title === session.title);

  if (existingIndex >= 0) {
    index[existingIndex] = metadata;
  } else {
    index.push(metadata);
  }

  writeSavedSessionIndex(index);
  localStorage.setItem(getSessionStorageKey(session.title), JSON.stringify(session));
};

export const deleteSessionFromStorage = (title: string) => {
  localStorage.removeItem(getSessionStorageKey(title));
  localStorage.removeItem(title);

  const index = getSavedSessions().filter((item) => item.title !== title);
  writeSavedSessionIndex(index);
};

export const resolveImportedSessionTitle = (baseTitle: string) => {
  const trimmedBaseTitle = baseTitle.trim();
  const existingTitles = new Set(getSavedSessions().map((item) => item.title));

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

export const importSessionToStorage = (session: SessionObject) => {
  const resolvedTitle = resolveImportedSessionTitle(session.title);
  const resolvedSession =
    resolvedTitle === session.title
      ? session
      : {
          ...session,
          title: resolvedTitle,
        };

  saveSessionToStorage(resolvedSession);

  return resolvedSession;
};
