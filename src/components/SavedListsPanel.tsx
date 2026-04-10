import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Download, Layers3, Search, Trash2, Upload } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import { FaAngleLeft } from "react-icons/fa";
import NavButton from "./utils/NavButton";
import toast from "react-hot-toast";
import {
  deleteSessionRecord,
  formatDurationLabel,
  importSessionRecord,
  listSavedSessions,
  loadSavedSession,
  normalizeSession,
} from "../lib/sessionStorage";
import type { SavedSessionMetadata } from "../types/pomo";
import { formatLocalizedDate } from "../lib/i18n";

export default function SavedListsPanel() {
  const { setPage, setSession, language, t } = usePomo();
  const [savedLists, setSavedLists] = useState<SavedSessionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState<string | null>(null);

  const refreshSavedLists = useCallback(async () => {
    setIsLoading(true);
    setSavedLists(await listSavedSessions());
    setIsLoading(false);
  }, []);

  const filteredSavedLists = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedLists;
    }

    return savedLists.filter((list) =>
      list.title.toLowerCase().includes(normalizedQuery)
    );
  }, [savedLists, searchQuery]);

  useEffect(() => {
    refreshSavedLists().catch(() => {
      toast.error(t("lists.fetchError"));
    });
  }, [refreshSavedLists, t]);

  useEffect(() => {
    if (!confirmDeleteTitle) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setConfirmDeleteTitle(null);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [confirmDeleteTitle]);

  const handleLoad = useCallback(
    async (list: SavedSessionMetadata) => {
      const parsedList = await loadSavedSession(list.title);

      if (parsedList) {
        setSession(parsedList);
        setPage("sessionControl");
        toast.success(t("lists.loadSuccess", { title: list.title }));
      } else {
        toast.error(t("lists.loadError"));
      }
    },
    [setPage, setSession, t]
  );

  const handleDelete = useCallback(
    async (list: SavedSessionMetadata) => {
      if (confirmDeleteTitle !== list.title) {
        setConfirmDeleteTitle(list.title);
        return;
      }

      await deleteSessionRecord(list.title);
      await refreshSavedLists();
      setConfirmDeleteTitle(null);
      toast.success(t("lists.deleteSuccess", { title: list.title }));
    },
    [confirmDeleteTitle, refreshSavedLists, t]
  );

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        try {
          const parsed = JSON.parse(loadEvent.target?.result as string);
          const normalized = normalizeSession(parsed);

          if (!normalized) {
            toast.error(t("lists.invalidImport"));
            return;
          }

          const importedSession = await importSessionRecord(normalized);
          await refreshSavedLists();
          setSession(importedSession);
          setPage("sessionControl");
          toast.success(t("lists.importSuccess", { title: importedSession.title }));
        } catch {
          toast.error(t("lists.importReadError"));
        } finally {
          event.target.value = "";
        }
      };

      reader.readAsText(file);
    },
    [refreshSavedLists, setPage, setSession, t]
  );

  return (
    <motion.div
      className="flex h-full w-full flex-col overflow-auto px-6 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex items-start gap-3 justify-start">
        <NavButton
          icon={FaAngleLeft}
          onClick={() => setPage("sessionControl")}
          ClassName="!flex-none self-start"
        />
          <h2 className="text-2xl font-semibold text-gray-800 ">{t("lists.title")}</h2>
      </div>

      <label className="mb-5 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600">
        <Upload size={16} />
        {t("lists.import")}
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </label>

      {savedLists.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("lists.searchPlaceholder")}
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            {filteredSavedLists.length}/{savedLists.length}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 flex flex-col gap-2">
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : savedLists.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-gray-700">{t("lists.emptyTitle")}</h3>
          <p className="mt-2 text-sm text-gray-500">
            {t("lists.emptyDescription")}
          </p>
        </div>
      ) : filteredSavedLists.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-gray-700">{t("lists.noResultsTitle")}</h3>
          <p className="mt-2 text-sm text-gray-500">
            {t("lists.noResultsDescription")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 pb-2">
          {filteredSavedLists.map((list) => (
            <motion.li
              key={list.title}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-800">{list.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                      <Layers3 size={12} />
                      {t("lists.intervals", { count: list.intervalCount })}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                      <Clock3 size={12} />
                      {formatDurationLabel(list.totalDuration, language)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                      {t("lists.updatedAt", {
                        date: formatLocalizedDate(language, list.updatedAt),
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      handleLoad(list).catch(() => {
                        toast.error(t("lists.loadError"));
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    title={t("lists.openTitle")}
                    type="button"
                  >
                    <Download size={14} />
                    {t("lists.open")}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(list).catch(() => {
                        toast.error(t("lists.deleteError"));
                      });
                    }}
                    className={`rounded-full p-1.5 transition ${
                      confirmDeleteTitle === list.title
                        ? "bg-red-100 text-red-600"
                        : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                    }`}
                    title={t("lists.deleteTitle")}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
